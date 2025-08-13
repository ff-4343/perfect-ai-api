"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/lib/prisma.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = prisma;
process.on('SIGINT', async () => {
    try {
        await prisma.$disconnect();
    }
    finally {
        process.exit(0);
    }
});
process.on('SIGTERM', async () => { prisma.$disconnect(); });
