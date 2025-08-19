// src/graphql/resolvers.ts
import { PrismaClient } from '@prisma/client';
import { getSession } from '@auth0/nextjs-auth0';

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    me: async (parent: any, args: any, context: any) => {
      const { user } = context;
      if (!user) return null;
      
      return await prisma.user.findUnique({
        where: { auth0Id: user.sub },
        include: { clockRecords: true }
      });
    },

    users: async () => {
      return await prisma.user.findMany({
        include: { clockRecords: true }
      });
    },

    myClockRecords: async (parent: any, args: any, context: any) => {
      const { user } = context;
      if (!user) throw new Error('Not authenticated');

      const dbUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      });

      if (!dbUser) throw new Error('User not found');

      return await prisma.clockRecord.findMany({
        where: { userId: dbUser.id },
        orderBy: { clockInTime: 'desc' },
        include: { user: true }
      });
    },

    allClockRecords: async () => {
      return await prisma.clockRecord.findMany({
        orderBy: { clockInTime: 'desc' },
        include: { user: true }
      });
    },

    activeClockRecords: async () => {
      return await prisma.clockRecord.findMany({
        where: { isActive: true },
        include: { user: true }
      });
    },

    clockRecordsByDateRange: async (parent: any, args: any) => {
      const { startDate, endDate } = args;
      return await prisma.clockRecord.findMany({
        where: {
          clockInTime: {
            gte: startDate,
            lte: endDate
          }
        },
        include: { user: true }
      });
    },

    myClockStats: async (parent: any, args: any, context: any) => {
      const { user } = context;
      if (!user) throw new Error('Not authenticated');

      const dbUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      });

      if (!dbUser) throw new Error('User not found');

      const records = await prisma.clockRecord.findMany({
        where: { userId: dbUser.id }
      });

      const completedShifts = records.filter(r => !r.isActive).length;
      const totalMinutes = records
        .filter(r => r.duration)
        .reduce((sum, r) => sum + (r.duration || 0), 0);
      const totalHours = totalMinutes / 60;
      const activeShifts = records.filter(r => r.isActive).length;
      const averageShiftHours = completedShifts > 0 ? totalHours / completedShifts : 0;

      return {
        totalHours,
        completedShifts,
        averageShiftHours,
        activeShifts
      };
    },

    allClockStats: async () => {
      const records = await prisma.clockRecord.findMany();
      
      const completedShifts = records.filter(r => !r.isActive).length;
      const totalMinutes = records
        .filter(r => r.duration)
        .reduce((sum, r) => sum + (r.duration || 0), 0);
      const totalHours = totalMinutes / 60;
      const activeShifts = records.filter(r => r.isActive).length;
      const averageShiftHours = completedShifts > 0 ? totalHours / completedShifts : 0;

      return {
        totalHours,
        completedShifts,
        averageShiftHours,
        activeShifts
      };
    },

    workplaceSettings: async () => {
      return await prisma.workplaceSettings.findFirst({
        where: { isActive: true }
      });
    }
  },

  Mutation: {
    createOrUpdateUser: async (parent: any, args: any) => {
      const { email, name, picture, role, auth0Id } = args;
      
      return await prisma.user.upsert({
        where: { email },
        update: { name, picture, role },
        create: {
          email,
          name,
          picture,
          role: role || 'careworker',
          auth0Id
        },
        include: { clockRecords: true }
      });
    },

    clockIn: async (parent: any, args: any, context: any) => {
      const { user } = context;
      if (!user) throw new Error('Not authenticated');

      const { note, latitude, longitude, address } = args;

      const dbUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      });

      if (!dbUser) throw new Error('User not found');

      // Check if user is already clocked in
      const activeRecord = await prisma.clockRecord.findFirst({
        where: {
          userId: dbUser.id,
          isActive: true
        }
      });

      if (activeRecord) {
        throw new Error('User is already clocked in');
      }

      const clockRecord = await prisma.clockRecord.create({
        data: {
          userId: dbUser.id,
          clockInTime: new Date(),
          clockInNote: note,
          clockInLocation: {
            lat: latitude,
            lng: longitude,
            address
          },
          isActive: true
        },
        include: { user: true }
      });

      return clockRecord;
    },

    clockOut: async (parent: any, args: any, context: any) => {
      const { user } = context;
      if (!user) throw new Error('Not authenticated');

      const { clockRecordId, note, latitude, longitude, address } = args;

      const clockOutTime = new Date();
      const record = await prisma.clockRecord.findUnique({
        where: { id: clockRecordId }
      });

      if (!record) {
        throw new Error('Clock record not found');
      }

      const duration = Math.floor((clockOutTime.getTime() - record.clockInTime.getTime()) / (1000 * 60));

      const updatedRecord = await prisma.clockRecord.update({
        where: { id: clockRecordId },
        data: {
          clockOutTime,
          clockOutNote: note,
          clockOutLocation: {
            lat: latitude,
            lng: longitude,
            address
          },
          duration,
          isActive: false
        },
        include: { user: true }
      });

      return updatedRecord;
    },

    updateWorkplaceSettings: async (parent: any, args: any) => {
      const { name, latitude, longitude, address, radius } = args;

      // First, deactivate all existing settings
      await prisma.workplaceSettings.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });

      // Create new settings
      return await prisma.workplaceSettings.create({
        data: {
          name: name || 'Healthcare Facility',
          latitude,
          longitude,
          address,
          radius: radius || 2000,
          isActive: true
        }
      });
    }
  }
};