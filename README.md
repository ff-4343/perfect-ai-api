# my-prisma-service

تشغيل محليًا باستخدام **قاعدة Render** البعيدة.

## الإعداد السريع

1) ثبّت الحزم:

```
yarn install
```

2. انسخ القالب وضع اتصال قاعدة Render:

```
cp .env.remote.example .env.remote
# افتح .env.remote والصق DATABASE_URL من Render (مع sslmode=require إن لزم)
```

3. أنشئ/حدّث الجداول على قاعدة Render وشغّل seed (اختياري):

```
yarn prisma:deploy   # ينفّذ المهاجرات على القاعدة البعيدة
yarn prisma:seed     # إضافة بيانات أولية
```

> بدلاً من deploy، لأول مرة يمكنك:

```
yarn prisma:migrate  # ينشئ migration ويدفعه مباشرة لقاعدة Render
```

4. تشغيل التطوير متصل بقاعدة Render:

```
yarn dev:remote
```

5. بناء وتشغيل (مع القاعدة البعيدة):

```
yarn build
yarn start:remote
```

## مسارات تجريب

* GET `http://localhost:3000/` → Health
* GET `http://localhost:3000/users` → قائمة المستخدمين
* POST `http://localhost:3000/users`

```json
{ "email": "new@example.com", "name": "New User" }
```

## مسارات إضافية

### المستخدمين
* GET `/users` - قائمة جميع المستخدمين
* POST `/users` - إنشاء مستخدم جديد
* GET `/users/:id` - الحصول على مستخدم محدد
* PUT `/users/:id` - تحديث مستخدم
* DELETE `/users/:id` - حذف مستخدم

### المنظمات والمشاريع (API المتقدم)
* GET `/api/orgs` - قائمة المنظمات
* POST `/api/orgs` - إنشاء منظمة
* GET `/api/orgs/:id` - منظمة مع مشاريعها
* GET `/api/projects?orgId=xxx` - قائمة المشاريع لمنظمة معينة
* POST `/api/projects` - إنشاء مشروع جديد

### أدوات التطوير
* GET `/docs` - واجهة Swagger UI للتوثيق التفاعلي
* GET `/admin` - لوحة إدارة بسيطة
* GET `/health` - فحص حالة الخدمة

## نشر على Render

* ضع `render.yaml` في الجذر. ✅
* ادفع إلى Git.
* تأكد أن اسم قاعدة البيانات في Render يطابق القيمة التي وضعتها في `render.yaml` تحت `fromDatabase.name`. هذا محدث قم بستبداله بلقديم

## البنية التقنية

- **إطار العمل**: Node.js + Express + TypeScript
- **قاعدة البيانات**: PostgreSQL مع Prisma ORM
- **المصادقة**: معدة للتوسعة
- **التوثيق**: Swagger/OpenAPI
- **الحماية**: Rate limiting + CORS
- **النشر**: Render مع Docker

## تطوير محلي

للتطوير مع قاعدة بيانات محلية، استخدم `.env.example` بدلاً من `.env.remote.example`:

```bash
cp .env.example .env
# ضع DATABASE_URL لقاعدة محلية
yarn dev
```