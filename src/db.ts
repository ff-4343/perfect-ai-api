// src/db.ts - Single-tenant client (backward compatibility)
import { PrismaClient } from '@prisma/client';

// Legacy single-tenant Prisma client for backward compatibility
// Use prismaService.getClient(tenantId) for multi-tenant applications
export const prisma = new PrismaClient();

export async function connectDB() {
  await prisma.$connect();
}

export async function disconnectDB() {
  await prisma.$disconnect();
}

// Re-export multi-tenant services for convenience
export { prismaService } from './services/prisma.service.js';
export { tenantService } from './services/tenant.service.js';
