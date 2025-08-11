# Perfect AI API - Multi-Tenant Platform

A robust multi-tenant API platform built with Node.js, Express, TypeScript, and Prisma. This platform enables you to provision and manage multiple isolated tenants (organizations) with tenant-scoped data access and operations.

## Features

- 🏢 **Multi-tenancy**: Complete tenant isolation with automatic data scoping
- 🔐 **Tenant Resolution**: Flexible tenant identification via headers, subdomains, domains, or route parameters
- 📊 **Tenant Management**: Bootstrap, manage, and monitor tenant organizations
- 🛡️ **Data Isolation**: Automatic tenant-scoped database queries
- 🚀 **Express Integration**: Seamless middleware integration with Express routes
- 📚 **TypeScript**: Full type safety and excellent developer experience
- 🗄️ **Prisma ORM**: Type-safe database operations with automatic migrations
- 📖 **API Documentation**: Built-in Swagger/OpenAPI documentation
- 🎛️ **Admin Panel**: Web-based admin interface for tenant management

## Architecture

### Multi-Tenant Model

Each tenant (organization) has:
- **Isolation**: Complete data separation at the database level
- **Users**: Tenant-scoped user management
- **Projects**: Project management within tenant context
- **E-commerce**: Optional products, orders, and cart functionality (based on plan)
- **Customization**: Tenant-specific settings and configuration

### Database Schema

The system uses a single database with tenant-aware models:

```prisma
model Organization {
  id       String @id @default(cuid())
  name     String
  slug     String @unique
  domain   String? @unique
  status   String @default("active")
  plan     String @default("basic")
  settings Json?
  
  // All related models include orgId for tenant scoping
  users    User[]
  projects Project[]
  products Product[]
  // ... other relations
}
```

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd perfect-ai-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` with your settings:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/perfect_ai

# Server
PORT=3000
NODE_ENV=development

# CORS (optional)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Multi-tenant settings
TENANT_RESOLUTION_METHOD=header
TENANT_HEADER_NAME=x-tenant-slug
TENANT_REQUIRED=false
```

### 3. Database Setup

**Note**: Due to network restrictions in some environments, Prisma binary downloads may fail. If you encounter this issue, try these steps:

```bash
# Method 1: Generate Prisma client (if binaries are available)
npx prisma generate

# Method 2: If generate fails, use the setup script
npm run setup

# Method 3: Manual database setup (if you have access to a PostgreSQL instance)
npx prisma db push

# Method 4: For development without database (will use mock services)
# The application includes comprehensive mock services for development
```

If Prisma generation fails due to network issues, the application is designed to work with mock services for development and testing purposes.

### 4. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Production build and start
npm run build
npm start
```

The server will be available at `http://localhost:3000`.

## Usage

### Admin Panel

Visit `http://localhost:3000/admin` to access the web-based admin panel where you can:

- Bootstrap new tenants
- View and manage existing tenants
- Test tenant-scoped API endpoints
- Monitor tenant statistics

### API Documentation

Interactive API documentation is available at `http://localhost:3000/docs`.

### Tenant Bootstrap

Create a new tenant organization:

```bash
curl -X POST http://localhost:3000/api/tenants/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme",
    "domain": "acme.example.com",
    "plan": "pro",
    "adminUser": {
      "email": "admin@acme.com",
      "name": "John Doe"
    }
  }'
```

### Tenant-Scoped Operations

#### Using Headers

```bash
# Get tenant users
curl -H "x-tenant-slug: acme" \
  http://localhost:3000/tenant/acme/users

# Create tenant project
curl -X POST \
  -H "x-tenant-slug: acme" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Project", "description": "A sample project"}' \
  http://localhost:3000/api/projects
```

#### Using Subdomains

Configure your DNS/hosts to point subdomains to your server:

```
# /etc/hosts (for local development)
127.0.0.1 acme.localhost
127.0.0.1 tenant2.localhost
```

Then access:
- `http://acme.localhost:3000/api/projects` (automatically resolves to acme tenant)
- `http://tenant2.localhost:3000/api/users` (automatically resolves to tenant2)

#### Using Route Parameters

```bash
# Access via route parameter
curl http://localhost:3000/tenant/acme/projects
curl http://localhost:3000/tenant/acme/users
```

## API Endpoints

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/admin` | Admin panel UI |
| `GET` | `/docs` | API documentation |

### Tenant Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tenants/bootstrap` | Create and bootstrap new tenant |
| `GET` | `/api/tenants` | List all tenants |
| `GET` | `/api/tenants/:slug` | Get tenant details |
| `PUT` | `/api/tenants/:slug` | Update tenant |

### Tenant-Scoped Endpoints

All these endpoints require tenant context (via header, subdomain, domain, or route param):

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tenant/:slug/users` | Get tenant users |
| `GET` | `/tenant/:slug/projects` | Get tenant projects |
| `GET` | `/api/projects` | Legacy projects endpoint (tenant-aware) |
| `GET` | `/api/orgs` | Legacy orgs endpoint (tenant-aware) |

## Development

### Project Structure

```
src/
├── app.ts                    # Main application with tenant bootstrap
├── server.ts                 # Server entry point
├── db.ts                     # Database connection
├── docs.ts                   # API documentation
├── services/
│   ├── tenant.service.ts     # Tenant management service
│   └── prisma.service.ts     # Tenant-scoped Prisma service
├── middleware/
│   └── tenant.middleware.ts  # Tenant resolution middleware
├── routes/                   # API route handlers
│   ├── orgs.ts
│   └── projects.ts
├── lib/
│   └── prisma.ts            # Prisma client setup
└── types/                   # TypeScript type definitions
    └── swagger-ui-express.d.ts

prisma/
└── schema.prisma            # Database schema
```

### Key Components

#### 1. Tenant Service (`TenantService`)

Manages tenant lifecycle:
- `createTenant()` - Create new tenant
- `bootstrapTenant()` - Initialize tenant with default data
- `getTenantStats()` - Get usage statistics

#### 2. Tenant-Scoped Prisma (`TenantPrismaService`)

Provides automatic tenant filtering:
- All database queries are automatically scoped to the current tenant
- Prevents accidental cross-tenant data access
- Type-safe operations

#### 3. Tenant Middleware

Automatically resolves tenant context from:
- **Headers**: `x-tenant-slug: acme`
- **Subdomains**: `acme.yourdomain.com`
- **Custom Domains**: `acme.com`
- **Route Parameters**: `/tenant/acme/endpoint`

### Adding New Tenant-Scoped Models

1. **Update Prisma Schema** (`prisma/schema.prisma`):

```prisma
model NewModel {
  id        String @id @default(cuid())
  orgId     String  // Tenant reference
  name      String
  // ... other fields

  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  
  @@index([orgId])
}

model Organization {
  // ... existing fields
  newModels NewModel[]  // Add relation
}
```

2. **Extend Tenant Prisma Service** (`src/services/prisma.service.ts`):

```typescript
get newModels() {
  const tenantId = this.context.tenantId;
  return {
    findMany: (args?: any) => this.prisma.newModel.findMany({
      ...args,
      where: { ...args?.where, orgId: tenantId }
    }),
    create: (args: any) => this.prisma.newModel.create({
      ...args,
      data: { ...args.data, orgId: tenantId }
    }),
    // ... other operations
  };
}
```

3. **Create Route Handler**:

```typescript
app.get('/tenant/:tenantSlug/new-models',
  createTenantMiddleware(prisma, { slugParam: 'tenantSlug' }),
  withTenant(async (req: Request, res: Response) => {
    const items = await req.tenantPrisma!.newModels.findMany();
    res.json({ success: true, items });
  })
);
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="TenantService"
```

### Building for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Or use PM2 for production
pm2 start dist/server.js --name perfect-ai-api
```

## Deployment

### Database Migration

```bash
# Generate migration
npx prisma migrate dev --name "add-new-feature"

# Deploy to production
npx prisma migrate deploy
```

### Environment Variables

Ensure these variables are set in production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=3000
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Security Considerations

### Tenant Isolation

- ✅ All database queries are automatically scoped by `orgId`
- ✅ Middleware validates tenant access before processing requests
- ✅ Raw queries should be avoided or carefully reviewed
- ✅ Admin endpoints require proper authentication (implement as needed)

### Best Practices

1. **Always use tenant-scoped Prisma service** in route handlers
2. **Validate tenant access** before performing operations
3. **Use the `withTenant` wrapper** for tenant-required routes
4. **Implement proper authentication** for admin operations
5. **Monitor cross-tenant data leaks** in logs and metrics

## Troubleshooting

### Common Issues

#### Tenant Not Found
```
Error: Organization with slug 'xyz' not found
```
- Verify the tenant exists: `GET /api/tenants`
- Check slug spelling and case sensitivity
- Ensure tenant status is 'active'

#### Missing Tenant Context
```
Error: Tenant context not available
```
- Ensure tenant middleware is applied to the route
- Verify tenant identification method (header, subdomain, etc.)
- Check that tenant exists and is accessible

#### Database Connection Issues
```
Error: Can't reach database server
```
- Verify `DATABASE_URL` in `.env`
- Ensure database is running and accessible
- Check network connectivity and firewall rules

### Debug Mode

Enable debug logging:

```env
TENANT_DEBUG=true
NODE_ENV=development
```

This will log tenant resolution attempts and help identify issues.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Run linting and tests: `npm run lint && npm test`
5. Commit changes: `git commit -am 'Add new feature'`
6. Push branch: `git push origin feature-name`
7. Create a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

- 📖 **Documentation**: Check this README and `/docs` endpoint
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Email**: Contact maintainers for enterprise support

---

## Changelog

### v1.0.0
- ✅ Multi-tenant architecture implementation
- ✅ Tenant bootstrap and management
- ✅ Flexible tenant resolution (headers, subdomains, domains, params)
- ✅ Tenant-scoped Prisma service
- ✅ Admin panel UI
- ✅ API documentation
- ✅ TypeScript support
- ✅ Express middleware integration