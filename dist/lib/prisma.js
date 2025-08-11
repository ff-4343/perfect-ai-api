import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;
process.on('SIGINT', async () => {
    try {
        await prisma.$disconnect();
    }
    finally {
        process.exit(0);
    }
});
process.on('SIGTERM', async () => { await prisma.$disconnect(); });
