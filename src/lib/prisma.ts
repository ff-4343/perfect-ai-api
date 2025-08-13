// src/lib/prisma.ts
let prisma;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error: any) {
  console.warn('Prisma client not available, using mock client:', error?.message || 'Unknown error');
  prisma = require('./prisma-mock').default;
}

export default prisma;

process.on('SIGINT', async () => {
  try { await prisma.$disconnect(); } finally { process.exit(0); }
});
process.on('SIGTERM', async () => { prisma.$disconnect(); });
