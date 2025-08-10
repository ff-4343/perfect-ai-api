import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Graceful shutdown
process.on('SIGINT', async () => {
  try { await prisma.$disconnect(); } finally { process.exit(0); }
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
});
