# Perfect AI API

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

Perfect AI API is a Node.js + TypeScript + Express REST API using Prisma ORM for database operations. It provides CRUD operations for Organizations and Projects with built-in admin UI, API documentation, rate limiting, and CORS support.

## Working Effectively

### Bootstrap and Setup

**CRITICAL**: Always use these exact commands and wait for completion. DO NOT cancel long-running operations.

1. **Install Dependencies** (takes ~1 minute):
   ```bash
   npm install
   ```
   - NEVER CANCEL: Wait for completion even if it seems slow
   - Expected warnings about Node version (requires 18.x, runs on 20.x) are safe to ignore

2. **Build the Application** (takes ~2 seconds):
   ```bash
   npm run build
   ```
   - Creates `dist/` directory with compiled JavaScript
   - Must complete successfully before running the app

3. **Generate Prisma Client** (requires network access, takes ~30 seconds):
   ```bash
   npm run prisma:generate
   ```
   - Downloads database engine binaries from internet
   - **May fail in restricted networks** - document if it doesn't work
   - Required before running the application

4. **Set up Environment** (required):
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` to set proper `DATABASE_URL`
   - For local development: `DATABASE_URL="file:./dev.db"` (SQLite)
   - For production: PostgreSQL connection string

5. **Run Database Migrations** (first time setup):
   ```bash
   npm run prisma:migrate
   ```
   - Creates database schema with User, Organization, and Project tables
   - **NEVER CANCEL**: Database operations must complete

### Running the Application

**Development Mode** (with hot reload):
```bash
npm run dev
```
- Uses nodemon + ts-node for automatic recompilation
- Server runs on http://localhost:3000 (or PORT from .env)
- **NEVER CANCEL**: Takes 5-10 seconds to start

**Production Mode**:
```bash
npm run start
```
- Runs compiled JavaScript from `dist/`
- Must run `npm run build` first
- Faster startup than development mode

### Key Endpoints and Manual Validation

Once the server is running, **ALWAYS** manually test these endpoints:

1. **Health Check**: GET `/health`
   - Should return `{"status": "ok"}`
   - Tests basic server functionality

2. **Admin UI**: GET `/admin`
   - Interactive web interface for managing organizations and projects
   - **VALIDATION SCENARIO**: Create an organization, then create a project under it
   - Test both operations work end-to-end

3. **API Documentation**: GET `/docs`
   - Swagger UI with full API specification
   - Use this to understand all available endpoints

4. **API Endpoints**:
   - `GET /api/orgs` - List organizations
   - `POST /api/orgs` - Create organization
   - `GET /api/projects?orgId=<id>` - List projects for an organization
   - `POST /api/projects` - Create project

**Manual Testing Requirements**:
- **ALWAYS** test the complete organization → project creation workflow
- **ALWAYS** verify the admin UI displays created data correctly  
- **ALWAYS** check that API responses match the OpenAPI specification

### Development Workflow

**Making Changes**:
1. Edit TypeScript files in `src/`
2. For development: changes auto-reload with `npm run dev`  
3. For production testing: run `npm run build` then `npm start`
4. **ALWAYS** test your changes using the admin UI and API endpoints

**Common File Locations**:
- **Main server**: `src/server.ts` - Express app setup, middleware, routes
- **Database config**: `src/lib/prisma.ts` - Prisma client setup
- **API routes**: `src/routes/orgs.ts` and `src/routes/projects.ts`  
- **API docs**: `src/docs.ts` - OpenAPI specification
- **Database schema**: `prisma/schema.prisma` - User, Organization, Project models

### Build Times and Timeouts

Set these timeout values for long-running operations:

- `npm install`: Use 5+ minute timeout (usually ~1 minute)
- `npm run build`: Use 1+ minute timeout (usually ~2 seconds)
- `npm run prisma:generate`: Use 5+ minute timeout (usually ~30 seconds)
- `npm run prisma:migrate`: Use 10+ minute timeout (database dependent)
- Server startup: Use 2+ minute timeout (usually ~10 seconds)

**NEVER CANCEL** any of these operations. If they appear to hang, wait the full timeout period.

## Application Architecture

### Database Models (Prisma)
- **User**: Basic user model with email and name
- **Organization**: Company/team entity with name and timestamps
- **Project**: Belongs to an organization, has name, archetype, status, and flexible spec (JSON)

### Key Dependencies
- **Express**: Web server and routing
- **Prisma**: Database ORM with PostgreSQL/SQLite support
- **TypeScript**: Type safety and compilation
- **cors**: Cross-origin request handling
- **express-rate-limit**: API rate limiting (120 req/minute per IP)
- **swagger-ui-express**: API documentation UI
- **nodemon + ts-node**: Development hot reloading

### API Features
- **Rate limiting**: 120 requests per minute per IP address
- **CORS**: Configurable via CORS_ORIGIN environment variable
- **OpenAPI docs**: Full API specification at `/docs`
- **Admin UI**: Web interface for data management at `/admin`
- **Error handling**: Proper HTTP status codes and error messages

## Common Tasks

### Repository Structure
```
.
├── src/
│   ├── server.ts          # Main application entry point
│   ├── lib/prisma.ts      # Database client setup
│   ├── routes/
│   │   ├── orgs.ts        # Organization CRUD operations
│   │   └── projects.ts    # Project CRUD operations
│   ├── docs.ts            # OpenAPI specification
│   └── types/             # TypeScript type definitions
├── prisma/
│   └── schema.prisma      # Database schema definition
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── render.yaml           # Deployment configuration
```

### Environment Variables (.env)
```
PORT=3000                                    # Server port
DATABASE_URL="file:./dev.db"               # SQLite for local development
DATABASE_URL="postgresql://user:pass@host:5432/db"  # PostgreSQL for production
CORS_ORIGIN=                                # Comma-separated allowed origins (empty = allow all)
```

### Package.json Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:deploy` - Deploy migrations (production)

## Troubleshooting

### Common Issues:
1. **"Prisma client not generated"** - Run `npm run prisma:generate`
2. **"Cannot find module" errors** - Run `npm install`
3. **"Database connection failed"** - Check DATABASE_URL in `.env`
4. **Network errors during Prisma setup** - Prisma needs internet access to download database engines

### Network Restrictions:
- Prisma requires internet access to download database engine binaries
- If `npm run prisma:generate` fails with network errors, document this limitation
- In restricted environments, pre-built Prisma engines may be required

### Validation After Changes:
1. **Build successfully**: `npm run build` must complete without errors
2. **Server starts**: Application must start and serve traffic
3. **Database operations work**: Test organization and project creation via admin UI
4. **API responses valid**: Check responses match OpenAPI spec at `/docs`

Always test the complete user workflow: create organization → create project → verify data appears correctly in admin UI.

## Validation Script

After following these instructions, run the provided validation script to ensure everything is set up correctly:

```bash
./validate-setup.sh
```

This script checks:
- Dependencies are installed
- TypeScript compilation works
- Environment is configured
- Prisma client generation status
- Application startup capability

The script will report "VALIDATION PASSED" if you have successfully followed the instructions.