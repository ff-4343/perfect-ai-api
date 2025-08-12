// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

let prisma: any;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.warn('⚠️  Prisma client initialization failed, using mock client for development');
  console.warn('Error:', (error as Error).message);
  
  // Import mock client for development when Prisma generation fails
  const { default: mockPrisma } = await import('./prisma-mock.js');
  prisma = mockPrisma;
}

export default prisma;

process.on('SIGINT', async () => {
  try { await prisma.$disconnect(); } finally { process.exit(0); }
});
process.on('SIGTERM', async () => { prisma.$disconnect(); });
