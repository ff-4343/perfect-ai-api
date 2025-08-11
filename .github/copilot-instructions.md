# Perfect AI API

Perfect AI API is a TypeScript Express.js REST API server using Prisma ORM with PostgreSQL for managing organizations and projects. It includes built-in Swagger documentation, admin UI, rate limiting, and CORS configuration.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup
- Install Node.js dependencies: `npm install` -- takes ~30 seconds. Set timeout to 60+ seconds.
- Install missing type definitions if needed: `npm install --save-dev @types/swagger-ui-express`
- Generate Prisma client: `npm run prisma:generate` -- **CRITICAL: Requires internet access to download Prisma engines. If this fails due to network restrictions, the application cannot run.**

### Building and Development
- Build TypeScript: `npm run build` -- takes ~2 seconds. NEVER CANCEL.
- Development mode: `npm run dev` -- starts server on port 3000 with hot reload
- Production mode: `npm start` -- runs built JavaScript from dist/ folder
- **CRITICAL**: Both dev and production modes require Prisma client to be generated first. If `prisma generate` fails, the application will not start.

### Database Requirements
- PostgreSQL database required (configured via DATABASE_URL environment variable)
- No migrations - uses `prisma db push` for schema changes
- Schema file: `prisma/schema.prisma` defines Organization and Project models
- **IMPORTANT**: The application will fail to start without a valid database connection

### Environment Configuration
- Copy `.env.example` to `.env` and configure:
  - `DATABASE_URL`: PostgreSQL connection string (required)
  - `PORT`: Server port (default: 3000) 
  - `CORS_ORIGIN`: Optional comma-separated list of allowed origins

## Validation and Testing

### Manual Validation Scenarios
After making changes, ALWAYS test these core scenarios:
1. **Health Check**: `curl http://localhost:3000/health` should return `{"status":"ok"}`
2. **Organization CRUD**:
   - List: `curl http://localhost:3000/api/orgs`
   - Create: `curl -X POST -H "Content-Type: application/json" -d '{"name":"Test Org"}' http://localhost:3000/api/orgs`
3. **Project CRUD**:
   - List: `curl http://localhost:3000/api/projects?orgId=<org-id>`
   - Create: `curl -X POST -H "Content-Type: application/json" -d '{"orgId":"<org-id>","name":"Test Project"}' http://localhost:3000/api/projects`
4. **Documentation**: Visit `http://localhost:3000/docs` for Swagger UI
5. **Admin UI**: Visit `http://localhost:3000/admin` for built-in admin interface

### Known Limitations
- **CRITICAL**: No test suite exists - manual validation is required
- **CRITICAL**: No linting configuration (ESLint/Prettier) - code style validation not automated
- **CRITICAL**: No CI/CD workflows - build validation must be done locally
- **SECURITY**: npm audit shows 8 vulnerabilities (3 low, 2 moderate, 3 high) - consider running `npm audit fix --force` but test thoroughly afterwards as it may update Express to incompatible versions
- **NETWORK**: Prisma client generation requires internet access to download binary engines

### Build Time Expectations
- **NEVER CANCEL**: npm install takes ~30 seconds - set timeout to 60+ seconds minimum
- **NEVER CANCEL**: npm run build takes ~2 seconds - always completes quickly
- **NEVER CANCEL**: Prisma generate takes ~10 seconds when network is available - set timeout to 300+ seconds for network issues

## Architecture Overview

### Key Files and Directories
```
src/
├── server.ts          # Main Express app with middleware and routes
├── routes/
│   ├── orgs.ts       # Organizations CRUD endpoints
│   └── projects.ts   # Projects CRUD endpoints  
├── lib/
│   └── prisma.ts     # Prisma client initialization
├── docs.ts           # OpenAPI/Swagger specification
└── db.ts             # Database utilities (if present)

prisma/
└── schema.prisma     # Database schema definition

dist/                 # TypeScript build output (created after npm run build)
```

### API Endpoints
- `GET /health` - Health check
- `GET /docs` - Swagger documentation UI
- `GET /admin` - Built-in admin interface
- `GET /api/orgs` - List organizations
- `POST /api/orgs` - Create organization
- `GET /api/orgs/:id` - Get organization with projects
- `POST /api/orgs/:id/projects` - Create project under organization
- `GET /api/projects?orgId=<id>` - List projects for organization
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project  
- `DELETE /api/projects/:id` - Delete project

### TypeScript Configuration Notes
- Uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
- **IMPORTANT**: All local imports must use explicit `.js` extensions (e.g., `import { prisma } from '../lib/prisma.js'`)
- Missing type definitions for `swagger-ui-express` may need to be installed separately

### Deployment
- Configured for Render deployment via `render.yaml`
- Build command: `npm install && npm run prisma:generate && npm run build`
- Start command includes database migration/push before starting server
- Uses port from environment variable or defaults to 3000

## Common Tasks

### Adding New API Endpoints
1. Define route handlers in `src/routes/` directory
2. Update OpenAPI specification in `src/docs.ts`
3. Register routes in `src/server.ts`
4. Build and test manually since no automated tests exist

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes (no migration files used)
3. Run `npm run prisma:generate` to update TypeScript client
4. Test API endpoints that use modified models

### Working Without Database
- Application cannot start without valid database connection
- For development without database, consider mocking the Prisma client in `src/lib/prisma.ts`
- All database operations are async and return Promises

## Troubleshooting

### "Prisma client did not initialize yet" Error
- Run `npm run prisma:generate` before starting the application
- Ensure DATABASE_URL is set in environment
- Check internet connectivity for Prisma engine downloads

### TypeScript Build Errors with Imports
- Ensure all local imports use `.js` extensions
- Install missing type definitions: `npm install --save-dev @types/<package-name>`

### Port Already in Use
- Check if server is already running: `lsof -i :3000`
- Change PORT environment variable or kill existing process