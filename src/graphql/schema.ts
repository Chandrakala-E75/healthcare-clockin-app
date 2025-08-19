// src/graphql/schema.ts
import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: String!
    email: String!
    name: String
    picture: String
    role: String!
    auth0Id: String
    createdAt: DateTime!
    updatedAt: DateTime!
    clockRecords: [ClockRecord!]!
  }

  type ClockRecord {
    id: String!
    userId: String!
    clockInTime: DateTime!
    clockOutTime: DateTime
    clockInNote: String
    clockOutNote: String
    clockInLocation: JSON
    clockOutLocation: JSON
    duration: Int
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
  }

  type WorkplaceSettings {
    id: String!
    name: String!
    latitude: Float!
    longitude: Float!
    address: String
    radius: Int!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClockStats {
    totalHours: Float!
    completedShifts: Int!
    averageShiftHours: Float!
    activeShifts: Int!
  }

  type Query {
    # User queries
    me: User
    users: [User!]!
    
    # Clock record queries
    myClockRecords: [ClockRecord!]!
    allClockRecords: [ClockRecord!]!
    activeClockRecords: [ClockRecord!]!
    clockRecordsByDateRange(startDate: DateTime!, endDate: DateTime!): [ClockRecord!]!
    
    # Stats queries
    myClockStats: ClockStats!
    allClockStats: ClockStats!
    
    # Workplace settings
    workplaceSettings: WorkplaceSettings
  }

  type Mutation {
    # User mutations
    createOrUpdateUser(
      email: String!
      name: String
      picture: String
      role: String
      auth0Id: String
    ): User!
    
    # Clock mutations
    clockIn(
      note: String
      latitude: Float!
      longitude: Float!
      address: String
    ): ClockRecord!
    
    clockOut(
      clockRecordId: String!
      note: String
      latitude: Float!
      longitude: Float!
      address: String
    ): ClockRecord!
    
    # Workplace settings mutations
    updateWorkplaceSettings(
      name: String
      latitude: Float
      longitude: Float
      address: String
      radius: Int
    ): WorkplaceSettings!
  }
`;