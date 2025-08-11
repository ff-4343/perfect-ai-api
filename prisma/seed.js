// prisma/seed.js (ESM)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // منظمة + مشروع مثال
  const org = await prisma.organization.upsert({
    where: { id: 'seed_org' },
    update: {},
    create: { id: 'seed_org', name: 'LEE VIP' }
  });

  await prisma.project.create({
    data: { orgId: org.id, name: 'Landing Website', status: 'planning' }
  }).catch(()=>{});

  // خدمات عامة
  await prisma.service.createMany({
    data: [
      { slug: 'web-design', name: 'تصميم مواقع', description: 'مواقع حديثة وسريعة الاستجابة', priceFrom: 2500, sortOrder: 1 },
      { slug: 'mobile-app', name: 'تطبيقات موبايل', description: 'iOS & Android', priceFrom: 6000, sortOrder: 2 },
      { slug: 'platform-dev', name: 'منصات وأنظمة', description: 'منصات قابلة للتوسع', priceFrom: 12000, sortOrder: 3 }
    ],
    skipDuplicates: true
  });

  console.log('✅ Seed done');
}

main().then(()=>prisma.$disconnect()).catch(e=>{
  console.error(e);
  prisma.$disconnect().then(()=>process.exit(1));
});