"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
// src/db.ts
let prisma;
try {
    const { PrismaClient } = require('@prisma/client');
    exports.prisma = prisma = new PrismaClient();
}
catch (error) {
    console.warn('Prisma client not available, using mock client:', error?.message || 'Unknown error');
    exports.prisma = prisma = require('./lib/prisma-mock').default;
}
async function connectDB() {
    await prisma.$connect();
}
async function disconnectDB() {
    await prisma.$disconnect();
}
