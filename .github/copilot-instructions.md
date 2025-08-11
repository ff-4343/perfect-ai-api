# Perfect AI API

Perfect AI API is a TypeScript/Node.js REST API server built with Express, Prisma ORM, and PostgreSQL. It provides organization and project management functionality with built-in API documentation, admin interface, rate limiting, and CORS support.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Setup
- Install Node.js dependencies: `npm install --ignore-scripts`
  - Takes ~3-4 seconds. NEVER CANCEL. Set timeout to 5+ minutes.
  - **CRITICAL**: Use `--ignore-scripts` flag due to Prisma binary download restrictions in sandboxed environments.
- Set up environment file: `cp .env.example .env`
- Edit `.env` with proper database connection string
- Generate Prisma client: `npm run prisma:generate`
  - **NOTE**: This WILL FAIL in sandboxed environments due to network restrictions blocking `binaries.prisma.sh`
  - Document this failure as expected: "Prisma client generation fails due to binary download restrictions"
- TypeScript build: `npm run build`
  - **WILL FAIL** without Prisma client generation (expected in sandboxed environments)
  - Expected error: `Module '"@prisma/client"' has no exported member 'PrismaClient'`
  - Takes ~1-2 seconds. NEVER CANCEL. Set timeout to 5+ minutes.
  - Creates `dist/` directory with compiled JavaScript when successful

### Database Setup (Production/Development)
- **CRITICAL**: Requires PostgreSQL database connection for full functionality
- Use Docker for local testing: `docker run --name test-postgres -e POSTGRES_PASSWORD=testpass -e POSTGRES_USER=testuser -e POSTGRES_DB=perfect_ai_test -p 5432:5432 -d postgres:13`
- Update `.env` with: `DATABASE_URL=postgresql://testuser:testpass@localhost:5432/perfect_ai_test`
- Run migrations: `npx prisma migrate deploy` (production) or `npx prisma db push` (development)

### Running the Application
- Development mode: `npm run dev`
  - **WILL FAIL** without proper Prisma client generation due to sandboxed environment restrictions
  - Expected error: `@prisma/client did not initialize yet`
  - Takes ~2-3 seconds to start when working. NEVER CANCEL. Set timeout to 10+ minutes.
- Production mode: `npm start`
  - Requires successful `npm run build` first
  - **WILL FAIL** without database connection and Prisma client
- **Testing workaround**: Create mock server for basic functionality validation (see Validation section)

### Timing Expectations
- `npm install --ignore-scripts`: ~3-4 seconds. NEVER CANCEL. Set timeout to 5+ minutes.
- `npm run build`: ~1-2 seconds (FAILS without Prisma client). NEVER CANCEL. Set timeout to 5+ minutes.
- `npm run prisma:generate`: WILL FAIL (~3-4 seconds). Document as expected failure.
- Server startup: ~2-3 seconds when working. NEVER CANCEL. Set timeout to 10+ minutes.

## Validation

### Basic Functionality Testing
Due to sandboxed environment limitations, use this mock validation approach:

1. Verify TypeScript compilation works: `npm run build`
2. Verify package installation works: `npm install --ignore-scripts`
3. Create mock server for HTTP functionality testing:
```javascript
// Copy to test-server.js in project root
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3000, () => console.log('Test server running on port 3000'));
```
4. Test basic endpoints: `curl http://localhost:3000/health`

### **CRITICAL LIMITATION**: Full Application Cannot Run in Sandboxed Environment
- Prisma binary downloads are blocked by network restrictions
- Database connections require external PostgreSQL instance
- **Always document this limitation** in validation results
- Focus on static analysis, TypeScript compilation, and mock testing

### Manual Validation Scenarios (When Database Available)
1. **Health Check**: Visit `/health` - should return `{"status":"ok"}`
2. **API Documentation**: Visit `/docs` - should show Swagger UI interface
3. **Admin Panel**: Visit `/admin` - should show organization/project management interface
4. **Organization Flow**: 
   - GET `/api/orgs` - list organizations
   - POST `/api/orgs` with `{"name":"Test Org"}` - create organization
   - Verify response includes generated ID
5. **Project Flow**:
   - GET `/api/projects?orgId={org-id}` - list projects for organization
   - POST `/api/projects` with `{"name":"Test Project","orgId":"{org-id}"}` - create project
   - Verify project appears in organization's project list

### Linting and Code Quality
- **No linting configured** - the repository does not include ESLint, Prettier, or other code quality tools
- TypeScript compiler provides basic type checking via `npm run build`
- Always run `npm run build` before committing changes to ensure TypeScript compilation succeeds

## Common Tasks

### Key Files and Directories
```
/home/runner/work/perfect-ai-api/perfect-ai-api/
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── render.yaml              # Render.com deployment config
├── prisma/
│   └── schema.prisma        # Database schema definition
└── src/
    ├── server.ts            # Main application entry point
    ├── docs.ts              # OpenAPI/Swagger documentation
    ├── db.ts                # Database connection helper
    ├── lib/
    │   └── prisma.ts        # Prisma client setup
    ├── routes/
    │   ├── orgs.ts          # Organization API endpoints
    │   └── projects.ts      # Project API endpoints
    └── types/
        └── swagger-ui-express.d.ts  # Type definitions
```

### Package.json Scripts
```json
{
  "build": "tsc",                    // Compile TypeScript
  "start": "node dist/server.js",   // Run production server
  "dev": "tsx watch src/server.ts", // Development with auto-reload
  "prisma:generate": "prisma generate", // Generate Prisma client
  "postinstall": "prisma generate"  // Auto-generate after install
}
```

### Technology Stack
- **Runtime**: Node.js v20+ (specified in engines)
- **Language**: TypeScript with ESM modules
- **Framework**: Express.js with middleware:
  - CORS support with configurable origins
  - Rate limiting (120 requests/minute per IP)
  - JSON parsing with 1MB limit
- **Database**: PostgreSQL with Prisma ORM
- **Documentation**: OpenAPI 3.0 with Swagger UI at `/docs`
- **Admin Interface**: Custom HTML/JavaScript admin panel at `/admin`
- **Deployment**: Configured for Render.com platform

### Environment Variables
```bash
PORT=3000                                    # Server port (default: 3000)
DATABASE_URL=postgresql://user:pass@host:5432/db  # PostgreSQL connection
CORS_ORIGIN=https://domain1.com,https://domain2.com  # Allowed origins (optional)
```

### API Endpoints
- `GET /health` - Health check
- `GET /docs` - Swagger UI documentation  
- `GET /admin` - Admin interface
- `GET /api/orgs` - List organizations
- `POST /api/orgs` - Create organization
- `GET /api/projects` - List projects (requires `orgId` query parameter)
- `POST /api/projects` - Create project

### Database Schema Overview
Key models in `prisma/schema.prisma`:
- **Organization**: Main entity for multi-tenancy
- **User**: Users associated with organizations
- **Project**: Projects owned by organizations  
- **Product**: E-commerce products with categories, pricing
- **Cart/CartItem**: Shopping cart functionality
- **Order/OrderItem**: Order processing
- **Address**: User addresses for orders
- **WebhookEvent**: Event tracking system

### Common Development Patterns
- All models use `cuid()` for primary keys
- Multi-tenant architecture via `orgId` foreign keys
- Soft deletion patterns with `active` boolean fields
- Created/updated timestamp tracking on all entities
- JSON fields for flexible data storage (images, webhook payloads)
- Comprehensive indexing for performance

### Troubleshooting
**Error: `@prisma/client did not initialize yet`**
- Cause: Prisma client not generated due to network restrictions
- Solution: Document as expected limitation in sandboxed environments

**Error: `ENOTFOUND binaries.prisma.sh`**
- Cause: Network restrictions blocking Prisma binary downloads  
- Solution: Use `npm install --ignore-scripts` and document limitation

**Error: Database connection failed**
- Cause: PostgreSQL not running or incorrect DATABASE_URL
- Solution: Verify database is running and connection string is correct

### Best Practices
- Always use `--ignore-scripts` flag for npm install in sandboxed environments
- Set generous timeouts (5+ minutes) for build commands
- Document network limitations when validating Prisma functionality
- Test HTTP endpoints with curl for basic functionality verification
- Focus on TypeScript compilation and static analysis for code validation
- Create mock servers for testing HTTP layer without database dependencies