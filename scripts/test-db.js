import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to count dealers as a simple test
    const count = await prisma.dealer.count();
    console.log('Database connection successful. Dealer count:', count);
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();