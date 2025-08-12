// src/db.ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export async function connectDB() {
    await prisma.$connect();
}
export async function disconnectDB() {
    await prisma.$disconnect();
}
