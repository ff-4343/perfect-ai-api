"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
// src/db.ts
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
async function connectDB() {
    await exports.prisma.$connect();
}
async function disconnectDB() {
    await exports.prisma.$disconnect();
}
