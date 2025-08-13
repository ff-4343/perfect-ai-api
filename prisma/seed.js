import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Start seeding...');
    // Create sample users
    const user1 = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
        },
    });
    const user2 = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'Regular User',
        },
    });
    // Create sample organization
    const org = await prisma.organization.upsert({
        where: { id: 'sample-org-id' },
        update: {},
        create: {
            id: 'sample-org-id',
            name: 'Sample Organization',
        },
    });
    // Create sample projects
    const project1 = await prisma.project.upsert({
        where: { id: 'project-1' },
        update: {},
        create: {
            id: 'project-1',
            orgId: org.id,
            name: 'Sample Project 1',
            archetype: 'web',
            status: 'active',
            spec: {
                description: 'A sample web project',
                technologies: ['React', 'Node.js', 'PostgreSQL'],
            },
        },
    });
    const project2 = await prisma.project.upsert({
        where: { id: 'project-2' },
        update: {},
        create: {
            id: 'project-2',
            orgId: org.id,
            name: 'Sample Project 2',
            archetype: 'api',
            status: 'planning',
            spec: {
                description: 'A sample API project',
                technologies: ['FastAPI', 'Python', 'MongoDB'],
            },
        },
    });
    console.log('✅ Seeding completed');
    console.log({ user1, user2, org, project1, project2 });
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map