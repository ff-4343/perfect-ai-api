# Perfect AI API

API خلفية مبنية بـ Node.js وExpress مع Prisma ORM وPostgreSQL لإدارة المنظمات والمشاريع.

## المتطلبات الأساسية

- Node.js 20 أو أحدث
- PostgreSQL 
- npm أو yarn

## إعداد البيئة المحلية

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd perfect-ai-api
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. **إعداد متغيرات البيئة (مهم جداً!)**

انسخ الملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

**يجب تحديث المتغيرات التالية في ملف `.env`:**

#### DATABASE_URL
هذا المتغير **ضروري** لتشغيل Prisma. بدونه ستحصل على الخطأ التالي:
```
error: Environment variable not found: DATABASE_URL.
@prisma/client did not initialize yet. Please run 'prisma generate' and try to import it again.
```

**أمثلة للاستخدام المحلي:**
```bash
# PostgreSQL محلي
DATABASE_URL=postgresql://username:password@localhost:5432/perfect_ai

# أو باستخدام Docker
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/perfect_ai
```

**أمثلة لمنصات النشر:**

**Render:**
```bash
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

**Railway:**
```bash
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Heroku:**
```bash
DATABASE_URL=postgres://username:password@hostname:5432/database_name
```

#### متغيرات أخرى
```bash
# بورت الخادم (افتراضي: 3000)
PORT=3000

# السماح لنطاقات محددة فقط (اختياري)
CORS_ORIGIN=https://your-frontend.com,https://admin.com
```

### 4. إعداد قاعدة البيانات

#### إنشاء قاعدة البيانات
```sql
-- اتصل بـ PostgreSQL كمدير
psql -U postgres

-- أنشئ قاعدة البيانات
CREATE DATABASE perfect_ai;

-- أنشئ مستخدم (اختياري)
CREATE USER perfect_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE perfect_ai TO perfect_user;
```

#### تشغيل Migrations
```bash
# إنشاء وتطبيق migrations
npx prisma migrate dev --name init

# أو إذا كان لديك migrations جاهزة
npx prisma migrate deploy
```

#### إنشاء Prisma Client
```bash
npx prisma generate
```

### 5. تشغيل المشروع

#### وضع التطوير
```bash
npm run dev
```

#### وضع الإنتاج
```bash
npm run build
npm start
```

الخادم سيعمل على: `http://localhost:3000`

## API Documentation

بعد تشغيل الخادم، يمكنك الوصول إلى توثيق API عبر:
- Swagger UI: `http://localhost:3000/docs`
- لوحة Admin: `http://localhost:3000/admin`

## النشر

### Render

1. اربط مستودع GitHub بـ Render
2. أضف متغير البيئة `DATABASE_URL` في إعدادات Render
3. تأكد من أن `render.yaml` موجود ومُعد بشكل صحيح

### متغيرات البيئة المطلوبة للنشر:
```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
PORT=10000 (أو أي بورت يحدده مقدم الخدمة)
```

## حل المشاكل الشائعة

### خطأ: "Environment variable not found: DATABASE_URL"
- **السبب:** متغير `DATABASE_URL` غير موجود أو غير صحيح
- **الحل:** تأكد من وجود ملف `.env` مع `DATABASE_URL` صحيح

### خطأ: "Prisma Client did not initialize"
- **السبب:** `prisma generate` لم يتم تشغيله
- **الحل:** 
  ```bash
  npx prisma generate
  # أو
  npm run prisma:generate
  ```

### خطأ: "Can't reach database server"
- **السبب:** قاعدة البيانات غير متاحة أو رابط الاتصال خاطئ
- **الحل:** تأكد من:
  - تشغيل PostgreSQL
  - صحة `DATABASE_URL`
  - صحة اسم المستخدم وكلمة المرور

## التطوير

### هيكل المشروع
```
src/
  ├── routes/         # مسارات API
  ├── lib/           # مكتبات مساعدة  
  ├── types/         # تعريفات TypeScript
  ├── db.ts          # إعدادات Prisma
  ├── server.ts      # خادم Express الرئيسي
  └── docs.ts        # توثيق OpenAPI
prisma/
  └── schema.prisma  # مخطط قاعدة البيانات
```

### أوامر مفيدة
```bash
# عرض قاعدة البيانات بصرياً
npx prisma studio

# إعادة تعيين قاعدة البيانات  
npx prisma migrate reset

# إنشاء migration جديد
npx prisma migrate dev --name description

# تحديث Prisma Client
npx prisma generate
```