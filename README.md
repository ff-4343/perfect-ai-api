# My Prisma Service

Node.js + Prisma service with local development support and remote Render DB configuration.

## Features

- **ES Modules**: Full ES modules support with TypeScript
- **Dual Environment**: Local development with remote database connection
- **Database**: PostgreSQL with Prisma ORM
- **API**: Express.js REST API with CORS and rate limiting
- **Admin Panel**: Built-in web admin interface
- **Documentation**: Swagger/OpenAPI documentation
- **Seeding**: Database seeding with sample data

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL database (local or remote)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   - Copy `.env.example` to `.env` for local development
   - Edit `.env.remote` for remote database configuration
   - Update `DATABASE_URL` with your PostgreSQL connection string

3. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Database Migration**:
   ```bash
   # For remote database (using .env.remote)
   npm run prisma:migrate
   
   # For local database (using .env)
   npx prisma migrate dev --name init
   ```

5. **Seed Database** (optional):
   ```bash
   npm run prisma:seed
   ```

## Development

### Local Development
```bash
# Uses .env file
npm run dev
```

### Remote Development
```bash
# Uses .env.remote file
npm run dev:remote
```

The development server will start with:
- Hot reloading with nodemon
- TypeScript compilation with ts-node
- Environment variables loading

## Production

### Build
```bash
npm run build
```

### Start Production Server
```bash
# Local configuration
npm start

# Remote configuration
npm run start:remote
```

## API Endpoints

- `GET /health` - Health check
- `GET /docs` - Swagger documentation
- `GET /admin` - Admin panel
- `GET /api/orgs` - List organizations
- `POST /api/orgs` - Create organization
- `GET /api/orgs/:id` - Get organization with projects
- `GET /api/projects` - List projects (with optional orgId filter)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Database Schema

The application includes:
- **User**: Basic user management
- **Organization**: Company/team organization
- **Project**: Projects belonging to organizations

## Scripts

- `npm run dev` - Local development server
- `npm run dev:remote` - Development server with remote database
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server (local)
- `npm run start:remote` - Start production server (remote)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations (remote)
- `npm run prisma:deploy` - Deploy migrations (remote)
- `npm run prisma:seed` - Seed database with sample data (remote)

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)

### Optional
- `CORS_ORIGIN` - Comma-separated list of allowed origins (empty = allow all)

## Deployment

This project is configured for deployment on Render with the included `render.yaml` configuration.

The ES modules setup ensures compatibility with modern Node.js environments and provides better tree-shaking and performance.