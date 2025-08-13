# Test Endpoints Guide / دليل اختبار المسارات

Once you have the service running with a database connection, you can test these endpoints:

## Health Check / فحص الحالة

```bash
# Root health check (as mentioned in problem statement)
curl http://localhost:3000/

# Response: {"status":"ok","service":"my-prisma-service"}

# Alternative health endpoint  
curl http://localhost:3000/health

# Response: {"status":"ok"}
```

## Users API / واجهة المستخدمين

### List Users / قائمة المستخدمين
```bash
curl http://localhost:3000/users
```

### Create User / إنشاء مستخدم
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","name":"New User"}'
```

### Get Specific User / الحصول على مستخدم محدد
```bash
curl http://localhost:3000/users/1
```

### Update User / تحديث مستخدم
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

### Delete User / حذف مستخدم
```bash
curl -X DELETE http://localhost:3000/users/1
```

## Advanced API / الواجهة المتقدمة

### Organizations / المنظمات
```bash
# List organizations
curl http://localhost:3000/api/orgs

# Create organization
curl -X POST http://localhost:3000/api/orgs \
  -H "Content-Type: application/json" \
  -d '{"name":"شركة جديدة"}'
```

### Projects / المشاريع
```bash
# List projects for an organization
curl "http://localhost:3000/api/projects?orgId=org_123"

# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"orgId":"org_123","name":"مشروع جديد","status":"planning"}'
```

## Documentation / التوثيق

### Swagger UI
Visit: `http://localhost:3000/docs`

### Admin Panel / لوحة الإدارة
Visit: `http://localhost:3000/admin`

## Setup Commands Summary / ملخص أوامر الإعداد

```bash
# 1. Install dependencies
yarn install

# 2. Setup remote database config
cp .env.remote.example .env.remote
# Edit .env.remote with your Render DATABASE_URL

# 3. Deploy schema and seed data
yarn prisma:deploy
yarn prisma:seed

# 4. Run in development with remote database
yarn dev:remote

# 5. Build and run in production
yarn build
yarn start:remote
```

## Expected Test Results / النتائج المتوقعة للاختبار

After running `yarn prisma:seed`, you should have:
- 4 users (including admin@example.com, user1@example.com, etc.)
- 2 organizations (شركة التقنيات المتقدمة, مؤسسة الابتكار التقني)
- 2 projects (مشروع الذكاء الاصطناعي, منصة التجارة الإلكترونية)