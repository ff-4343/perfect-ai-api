# Perfect AI API

A Node.js + TypeScript + Prisma service for managing organizations and projects.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:deploy` - Deploy migrations to production

## API Endpoints

- `GET /health` - Health check
- `GET /api/orgs` - List organizations
- `POST /api/orgs` - Create organization
- `GET /api/orgs/:id` - Get organization with projects
- `POST /api/orgs/:id/projects` - Create project under organization
- `GET /api/projects` - List projects (with optional orgId filter)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Documentation

- Visit `/docs` for Swagger UI documentation
- Visit `/admin` for simple admin interface

## Database Models

### Organization
- `id` (String, cuid)
- `name` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `projects` (Relation to Project[])

### Project
- `id` (String, cuid)
- `orgId` (String, foreign key)
- `name` (String)
- `archetype` (String, default: "")
- `status` (String, default: "planning")
- `spec` (JSON, default: {})
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `organization` (Relation to Organization)

## Deployment

The service is configured for deployment on Render with the following:
- Node.js 18.x engine
- Automatic builds via `npm run build`
- Environment variable support
- Prisma database integration

## TypeScript Configuration

The project uses relaxed TypeScript settings to balance type safety with development speed:
- `noImplicitAny: false` - Allows gradual type adoption
- CommonJS module system for Node.js compatibility
- ES2020 target for modern JavaScript features