// src/db.ts
let prisma;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error: any) {
  console.warn('Prisma client not available, using mock client:', error?.message || 'Unknown error');
  prisma = require('./lib/prisma-mock').default;
}

export { prisma };

export async function connectDB() {
  await prisma.$connect();
}

export async function disconnectDB() {
  await prisma.$disconnect();
}
