// src/lib/prisma.ts
// Temporarily using mock database for development/testing
// TODO: Replace with real PrismaClient when database is available
import { randomUUID } from 'crypto';
// Simple in-memory data store
class MockDatabase {
    constructor() {
        this.orgs = [];
        this.projects = [];
        this.organization = {
            create: async ({ data }) => {
                const org = {
                    id: randomUUID(),
                    name: data.name,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                this.orgs.push(org);
                return org;
            },
            findMany: async ({ orderBy } = {}) => {
                const sorted = [...this.orgs];
                if (orderBy?.createdAt === 'desc') {
                    sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                }
                return sorted;
            },
            findUnique: async ({ where, include } = {}) => {
                const org = this.orgs.find(o => o.id === where.id);
                if (!org)
                    return null;
                if (include?.projects) {
                    const projects = this.projects.filter(p => p.orgId === org.id);
                    return { ...org, projects };
                }
                return org;
            }
        };
        this.project = {
            create: async ({ data }) => {
                // Check if org exists
                const orgExists = this.orgs.find(o => o.id === data.orgId);
                if (!orgExists) {
                    const error = new Error('Foreign key constraint failed');
                    error.code = 'P2003';
                    throw error;
                }
                const project = {
                    id: randomUUID(),
                    orgId: data.orgId,
                    name: data.name,
                    archetype: data.archetype || '',
                    status: data.status || 'planning',
                    spec: data.spec || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                this.projects.push(project);
                return project;
            },
            findMany: async ({ where = {}, orderBy = {}, take, skip = 0 } = {}) => {
                let filtered = [...this.projects];
                if (where.orgId) {
                    filtered = filtered.filter(p => p.orgId === where.orgId);
                }
                if (orderBy?.createdAt === 'desc') {
                    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                }
                if (take !== undefined) {
                    filtered = filtered.slice(skip, skip + take);
                }
                return filtered;
            },
            count: async ({ where = {} } = {}) => {
                let filtered = [...this.projects];
                if (where.orgId) {
                    filtered = filtered.filter(p => p.orgId === where.orgId);
                }
                return filtered.length;
            },
            findUnique: async ({ where }) => {
                return this.projects.find(p => p.id === where.id) || null;
            },
            update: async ({ where, data }) => {
                const project = this.projects.find(p => p.id === where.id);
                if (!project) {
                    const error = new Error('Record not found');
                    error.code = 'P2025';
                    throw error;
                }
                Object.assign(project, data, { updatedAt: new Date() });
                return project;
            },
            delete: async ({ where }) => {
                const index = this.projects.findIndex(p => p.id === where.id);
                if (index === -1) {
                    const error = new Error('Record not found');
                    error.code = 'P2025';
                    throw error;
                }
                return this.projects.splice(index, 1)[0];
            }
        };
        // Mock user methods (for compatibility)
        this.user = {
            create: async ({ data }) => ({ id: 1, ...data, createdAt: new Date() }),
            findMany: async () => [],
            findUnique: async () => null
        };
    }
    // Connection methods
    async $disconnect() {
        // Mock disconnect
    }
}
const prisma = new MockDatabase();
export default prisma;
process.on('SIGINT', async () => {
    try {
        await prisma.$disconnect();
    }
    finally {
        process.exit(0);
    }
});
process.on('SIGTERM', async () => { prisma.$disconnect(); });
