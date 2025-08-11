# Perfect AI API - Multi-Tenant Application

A multi-tenant API built with Express.js, Prisma, PostgreSQL, and TypeScript. Each tenant (site) has its own isolated PostgreSQL database while sharing the same codebase.

## 🏗️ Architecture

This application follows a **database-per-tenant** multi-tenancy pattern:

- **Admin Database**: Stores tenant metadata and management information
- **Tenant Databases**: Each tenant has its own isolated PostgreSQL database
- **Shared Codebase**: Single application serves all tenants with tenant-aware routing

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL database server
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd perfect-ai-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` with the following endpoints available:
- 📚 API Documentation: `http://localhost:3000/docs`
- 🔧 Admin Dashboard: `http://localhost:3000/admin`

## ⚙️ Environment Variables

Configure your `.env` file with the following variables:

```bash
# Server Configuration
PORT=3000

# Admin Database - used to manage tenants and metadata
ADMIN_DATABASE_URL=postgresql://USER:PASS@HOST:5432/perfect_ai_admin

# Default/Template Database URL for new tenants
DATABASE_URL=postgresql://USER:PASS@HOST:5432/perfect_ai_tenant_template

# Tenant database URL pattern - {tenant_id} will be replaced with actual tenant ID
TENANT_DATABASE_URL_PATTERN=postgresql://USER:PASS@HOST:5432/perfect_ai_tenant_{tenant_id}

# CORS Configuration (optional)
CORS_ORIGIN=https://your-frontend.com,https://admin.your-frontend.com
```

### Database URL Patterns

- **ADMIN_DATABASE_URL**: Central database for managing tenant information
- **DATABASE_URL**: Template database URL used by Prisma for migrations and generation
- **TENANT_DATABASE_URL_PATTERN**: Pattern for tenant-specific databases where `{tenant_id}` is replaced with the actual tenant ID

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Prisma
npm run prisma:generate  # Generate Prisma client
npx prisma db push      # Push schema changes to database
npx prisma studio       # Open Prisma Studio (database GUI)
```

## 🏢 Multi-Tenant Usage

### Creating a New Tenant

Use the admin dashboard or API to create a new tenant:

**Via API:**
```bash
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "company-abc", "tenantName": "ABC Company"}'
```

**Via Admin Dashboard:**
Visit `http://localhost:3000/admin` and use the "Tenant Management" section.

### Making Tenant-Scoped Requests

All tenant-scoped API calls require the `X-Tenant-ID` header:

```bash
# Create a user for a specific tenant
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: company-abc" \
  -d '{"email": "user@example.com", "name": "John Doe"}'

# List users for a tenant
curl http://localhost:3000/users \
  -H "X-Tenant-ID: company-abc"

# Create an organization for a tenant
curl -X POST http://localhost:3000/api/orgs \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: company-abc" \
  -d '{"name": "My Organization"}'
```

## 📚 API Endpoints

### Tenant Management
- `POST /tenants` - Create a new tenant
- `GET /tenants/:tenantId` - Get tenant information
- `GET /tenants/cache-stats` - Get Prisma client cache statistics

### Tenant-Scoped Endpoints
All require `X-Tenant-ID` header:

- `GET /users` - List users for the tenant
- `POST /users` - Create a user for the tenant
- `GET /api/orgs` - List organizations for the tenant
- `POST /api/orgs` - Create an organization for the tenant
- `GET /api/projects` - List projects for the tenant
- `POST /api/projects` - Create a project for the tenant

### System Endpoints
- `GET /health` - Health check
- `GET /docs` - API documentation (Swagger)
- `GET /admin` - Admin dashboard

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL. Key models include:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ... relations
}

model Organization {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  // ... relations
}

model Product {
  id          String  @id @default(cuid())
  orgId       String
  name        String
  description String?
  price       Decimal @default(0)
  // ... more fields
}
```

## 🔒 Security Features

- **Tenant Isolation**: Each tenant has completely isolated data in separate databases
- **Request Validation**: All tenant IDs are sanitized and validated
- **Rate Limiting**: 120 requests per minute per IP address
- **CORS Protection**: Configurable CORS origins
- **Input Sanitization**: Automatic sanitization of tenant IDs and user inputs

## 🧩 Architecture Components

### Services

#### `TenantService` (`src/services/tenant.service.ts`)
Manages tenant lifecycle:
- Create new tenant databases
- Get tenant information
- Delete tenants
- Generate database URLs

#### `PrismaService` (`src/services/prisma.service.ts`)
Manages Prisma client instances:
- Creates and caches Prisma clients per tenant
- Automatic cleanup of inactive clients (5-minute timeout)
- Connection pooling and resource management

### Middleware

#### `tenantMiddleware` (`src/middleware/tenant.middleware.ts`)
Extracts tenant ID from requests:
- Validates `X-Tenant-ID` header
- Sanitizes tenant IDs
- Attaches appropriate Prisma client to request
- Handles tenant-not-found errors

### Application Structure

```
src/
├── app.ts                      # Main Express application
├── server.ts                   # Server entry point
├── middleware/
│   └── tenant.middleware.ts    # Tenant extraction middleware
├── services/
│   ├── tenant.service.ts       # Tenant management
│   └── prisma.service.ts       # Multi-tenant Prisma clients
├── routes/                     # API routes
│   ├── orgs.ts
│   └── projects.ts
└── ...
```

## 🚀 Production Deployment

### Environment Setup

1. **Database Setup**: Create your PostgreSQL databases:
   - Admin database for tenant management
   - Template database for schema development
   - Individual databases for each tenant

2. **Environment Variables**: Set production environment variables:
   ```bash
   ADMIN_DATABASE_URL=postgresql://user:pass@prod-host:5432/perfect_ai_admin
   TENANT_DATABASE_URL_PATTERN=postgresql://user:pass@prod-host:5432/perfect_ai_tenant_{tenant_id}
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Database Migration**: Run Prisma migrations:
   ```bash
   npx prisma db push
   ```

4. **Build and Start**:
   ```bash
   npm run build
   npm start
   ```

### Scaling Considerations

- **Database Connections**: Monitor connection pool usage across tenants
- **Caching**: Prisma clients are automatically cached and cleaned up
- **Monitoring**: Use health check endpoint for monitoring
- **Load Balancing**: The application is stateless and can be horizontally scaled

## 🐛 Troubleshooting

### Common Issues

**Prisma generation fails:**
```bash
# Clear Prisma cache and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

**Tenant not found:**
- Verify the tenant ID exists
- Check the `X-Tenant-ID` header format
- Ensure database connectivity

**Connection issues:**
- Verify database URLs in environment variables
- Check PostgreSQL server status
- Validate connection credentials

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Links

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Multi-Tenant Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenancy)