# Perfect AI API

واجهة برمجة تطبيقات لإدارة المنظمات والمشاريع باستخدام Node.js، Express، وPrisma.

## متطلبات التشغيل

- Node.js 20 أو أحدث
- PostgreSQL قاعدة بيانات
- npm أو yarn

## الإعداد والتشغيل

### 1. تثبيت الحزم المطلوبة

```bash
npm install
```

### 2. إعداد قاعدة البيانات

انسخ ملف المتغيرات البيئية وحدث القيم:

```bash
cp .env.example .env
```

حدث متغير `DB_URL` في ملف `.env`:

```env
DB_URL=postgresql://username:password@localhost:5432/your_database_name
```

### 3. تهيئة قاعدة البيانات

قم بتنفيذ migrations لإنشاء الجداول:

```bash
npx prisma migrate dev
```

أو لقاعدة البيانات الإنتاجية:

```bash
npx prisma migrate deploy
```

### 4. توليد Prisma Client

```bash
npx prisma generate
```

### 5. بناء المشروع

```bash
npm run build
```

### 6. تشغيل التطبيق

للتطوير:
```bash
npm run dev
```

للإنتاج:
```bash
npm start
```

## الأوامر المتاحة

- `npm run build` - بناء المشروع باستخدام TypeScript
- `npm run start` - تشغيل التطبيق (بعد البناء)
- `npm run dev` - تشغيل التطبيق في وضع التطوير مع إعادة التحميل التلقائي
- `npm run prisma:generate` - توليد Prisma Client

## الواجهات المتاحة

- `GET /health` - فحص صحة التطبيق
- `GET /docs` - وثائق API باستخدام Swagger UI
- `GET /admin` - لوحة الإدارة البسيطة
- `GET|POST /api/orgs` - إدارة المنظمات
- `GET|POST /api/projects` - إدارة المشاريع

## الأمان

- Rate limiting: 120 طلب في الدقيقة لكل IP
- CORS قابل للتكوين عبر متغير البيئة `CORS_ORIGIN`
- حد حجم JSON: 1MB

## النشر

يمكن نشر التطبيق على Render.com أو أي منصة أخرى تدعم Node.js. تأكد من:

1. تعيين متغيرات البيئة المطلوبة
2. تشغيل migrations في البيئة الإنتاجية
3. التأكد من توفر قاعدة بيانات PostgreSQL

## استكشاف الأخطاء

### خطأ Prisma P1012

إذا واجهت خطأ P1012، تأكد من:

1. تعيين متغير البيئة `DB_URL` بشكل صحيح
2. تشغيل `npx prisma generate` بعد التغييرات
3. التأكد من أن قاعدة البيانات متاحة ويمكن الوصول إليها

### مشاكل الاتصال بقاعدة البيانات

1. تأكد من أن PostgreSQL يعمل
2. تحقق من صحة بيانات الاتصال في `DB_URL`
3. تأكد من أن قاعدة البيانات المحددة موجودة