// src/docs.ts
import type { OpenAPIV3 } from 'openapi-types';

/**
 * OpenAPI spec يغطي المسارات الموجودة فعليًا الآن:
 *  - GET  / (health at root)
 *  - GET  /health
 *  - GET  /users
 *  - POST /users
 *  - GET  /api/orgs
 *  - POST /api/orgs
 *  - GET  /api/projects?orgId=...
 *  - POST /api/projects
 */
export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Perfect API',
    version: '1.0.0',
    description:
      'CRUD للمستخدمين والمنظمات والمشاريع + health. جاهز للتوسعة (Auth, Swagger, Rate limit).',
  },
  servers: [
    { url: '/', description: 'Same origin (Render / local)' }
  ],
  tags: [
    { name: 'health', description: 'Service health' },
    { name: 'users', description: 'Users management' },
    { name: 'orgs', description: 'Organizations' },
    { name: 'projects', description: 'Projects belonging to organizations' }
  ],
  paths: {
    '/': {
      get: {
        tags: ['health'],
        summary: 'Health check (root)',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { 
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'my-prisma-service' }
                  }
                }
              }
            }
          }
        }
      }
    },

    '/health': {
      get: {
        tags: ['health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } }
                }
              }
            }
          }
        }
      }
    },

    '/users': {
      get: {
        tags: ['users'],
        summary: 'List users',
        responses: {
          '200': {
            description: 'Array of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['users'],
        summary: 'Create user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { 
            description: 'Email already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },

    '/api/orgs': {
      get: {
        tags: ['orgs'],
        summary: 'List organizations',
        responses: {
          '200': {
            description: 'Array of organizations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Organization' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['orgs'],
        summary: 'Create organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrgCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created organization',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' }
        }
      }
    },

    '/api/projects': {
      get: {
        tags: ['projects'],
        summary: 'List projects for an organization',
        parameters: [
          {
            in: 'query',
            name: 'orgId',
            required: true,
            schema: { type: 'string' },
            description: 'Organization ID (required)'
          }
        ],
        responses: {
          '200': {
            description: 'Array of projects',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Project' }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' }
        }
      },
      post: {
        tags: ['projects'],
        summary: 'Create project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProjectCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created project',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Project' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' }
        }
      }
    }
  },

  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          name: { type: 'string', nullable: true, example: 'John Doe' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'email', 'createdAt']
      },

      UserCreate: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'new@example.com' },
          name: { type: 'string', nullable: true, example: 'New User' }
        },
        required: ['email']
      },

      Organization: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'org_123' },
          name: { type: 'string', example: 'Acme Inc.' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'name', 'createdAt', 'updatedAt']
      },

      OrgCreate: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Acme Inc.' }
        },
        required: ['name']
      },

      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prj_abc' },
          orgId: { type: 'string', example: 'org_123' },
          name: { type: 'string', example: 'My Project' },
          archetype: { type: 'string', nullable: true, example: 'saas' },
          status: { type: 'string', example: 'planning' },
          spec: { type: 'object', additionalProperties: true, nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'orgId', 'name', 'status', 'createdAt', 'updatedAt']
      },

      ProjectCreate: {
        type: 'object',
        properties: {
          orgId: { type: 'string', example: 'org_123' },
          name: { type: 'string', example: 'Landing MVP' },
          archetype: { type: 'string', nullable: true },
          status: { type: 'string', example: 'planning' },
          spec: { type: 'object', additionalProperties: true, nullable: true }
        },
        required: ['orgId', 'name']
      },

      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' }
        },
        required: ['error']
      }
    },

    responses: {
      BadRequest: {
        description: 'Invalid input',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  }
};
