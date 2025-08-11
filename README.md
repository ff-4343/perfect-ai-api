# Perfect AI API - Updated Implementation

## Overview
This API provides a unified backend with comprehensive business functionality including organizations, projects, services, leads, assets, themes, API keys, chat, forms, and a flexible resource/event system.

## Database Schema

### Core Models
- **Organization**: Main tenant/company entity
- **Project**: Projects within organizations
- **Service**: Available services (can be global or org-specific)  
- **Lead**: Contact form submissions linked to services
- **Asset**: File/image storage linked to orgs/projects
- **Theme**: Theme configurations for projects
- **ApiKey**: Encrypted AI provider API keys
- **ChatSession** & **ChatMessage**: Chat functionality
- **Form** & **Submission**: Dynamic forms system
- **Resource** & **Event**: Generic flexible data layer

### Key Features
- **Backward Compatible**: Existing org/project routes remain unchanged
- **Multi-tenant**: Organization-based data isolation
- **Encrypted Storage**: API keys encrypted with AES-256-GCM
- **Flexible Resources**: Generic key-value resource system for extensibility
- **Event Tracking**: Audit trail for all resource changes

## New API Endpoints

### Services API (`/api/services`)
- `GET /api/services?orgId=<id>` - List services (filtered by org or global)
- `POST /api/services` - Create service
- `PATCH /api/services/:id` - Update service

### Contact/Leads API (`/api/contact`)
- `POST /api/contact` - Submit contact form (creates lead)
- `GET /api/contact?orgId=<id>&status=<status>` - List leads

### Resources API (`/api/resources`)
- `GET /api/resources?orgId=<id>&projectId=<id>&kind=<type>&status=<status>` - List resources
- `POST /api/resources` - Create resource

## Example Usage

### Creating a Service
```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "web-design",
    "name": "Web Design",
    "description": "Custom website design",
    "priceFrom": 2500,
    "sortOrder": 1
  }'
```

### Submitting a Contact Form
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Ali",
    "email": "ahmed@example.com", 
    "message": "I need a website for my business",
    "serviceSlug": "web-design",
    "budget": 5000
  }'
```

### Creating a Resource
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "catalog",
    "key": "products",
    "data": {
      "title": "Product Catalog",
      "items": []
    }
  }'
```

## Setup Instructions

1. Install dependencies: `npm install`
2. Set up environment variables (copy `.env.example` to `.env`)
3. Generate Prisma client: `npx prisma generate` 
4. Run migrations: `npx prisma migrate dev --name init`
5. Seed database: `npx prisma db seed`
6. Build: `npm run build`
7. Start: `npm start`

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `APP_SECRET`: 64-character hex key for encryption (generate with `openssl rand -hex 32`)
- `CORS_ORIGIN`: Comma-separated list of allowed origins (optional)
- `RATE_LIMIT_MAX`: Max requests per minute per IP (default: 120)
- `PORT`: Server port (default: 3000)

## Admin Interface
Access the admin panel at `/admin` to manage organizations and projects with a simple web interface.

## API Documentation
Swagger documentation available at `/docs`