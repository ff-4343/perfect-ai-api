// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات الأولية...');

  // حذف البيانات الموجودة
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();

  console.log('🗑️  تم مسح البيانات الموجودة');

  // إضافة منظمات
  const org1 = await prisma.organization.create({
    data: {
      name: 'شركة التقنيات المتقدمة',
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'مؤسسة الابتكار التقني',
    },
  });

  console.log('✅ تم إنشاء المنظمات');

  // إضافة مشاريع
  await prisma.project.create({
    data: {
      orgId: org1.id,
      name: 'مشروع الذكاء الاصطناعي',
      archetype: 'AI/ML',
      status: 'active',
      spec: {
        description: 'تطوير نظام ذكاء اصطناعي متقدم',
        budget: 100000,
        timeline: '6 months'
      },
    },
  });

  await prisma.project.create({
    data: {
      orgId: org2.id,
      name: 'منصة التجارة الإلكترونية',
      archetype: 'Web App',
      status: 'planning',
      spec: {
        description: 'منصة تجارة إلكترونية شاملة',
        budget: 50000,
        timeline: '4 months'
      },
    },
  });

  console.log('✅ تم إنشاء المشاريع');

  // إضافة مستخدمين
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'مدير النظام',
    },
  });

  await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'أحمد محمد',
    },
  });

  await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'فاطمة علي',
    },
  });

  await prisma.user.create({
    data: {
      email: 'developer@example.com',
      name: 'مطور التطبيقات',
    },
  });

  console.log('✅ تم إنشاء المستخدمين');

  console.log('🎉 تم الانتهاء من إضافة البيانات الأولية بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إضافة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });