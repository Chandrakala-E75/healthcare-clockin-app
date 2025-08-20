import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    return NextResponse.json({ 
      message: 'GraphQL endpoint working',
      database: 'Connected' 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ message: 'POST method working' });
}