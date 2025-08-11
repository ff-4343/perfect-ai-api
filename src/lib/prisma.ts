// Prisma client with graceful degradation when client generation fails
let prisma: any;

// Initialize mock client first as fallback
const createMockClient = () => ({
  organization: {
    create: () => Promise.reject(new Error('Database not available - Prisma client failed to initialize')),
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
  },
  project: {
    create: () => Promise.reject(new Error('Database not available - Prisma client failed to initialize')),
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    update: () => Promise.reject(new Error('Database not available - Prisma client failed to initialize')),
    delete: () => Promise.reject(new Error('Database not available - Prisma client failed to initialize')),
    count: () => Promise.resolve(0),
  },
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
});

// Try to initialize real Prisma client
try {
  const { PrismaClient } = require('@prisma/client');
  
  prisma = new PrismaClient({
    errorFormat: 'minimal',
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  console.log('✅ Prisma client initialized successfully');
} catch (error) {
  const errorMsg = (error as Error)?.message || String(error);
  console.warn('⚠️  Prisma client not available:', errorMsg);
  console.warn('ℹ️  API will run with limited functionality (no database operations)');
  
  prisma = createMockClient();
}

export { prisma };

process.on('SIGINT', async () => {
  try { await prisma.$disconnect(); } finally { process.exit(0); }
});
process.on('SIGTERM', async () => { await prisma.$disconnect(); });
