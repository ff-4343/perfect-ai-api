export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Perfect API',
    version: '1.0.0',
    description: 'Basic CRUD for Organizations & Projects',
  },
  servers: [{ url: '/' }],
  components: {
    schemas: {
      Organization: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orgId: { type: 'string' },
          name: { type: 'string' },
          archetype: { type: 'string' },
          status: { type: 'string', description: "e.g. 'planning' | 'active' | 'archived'" },
          spec: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health',
        responses: { 200: { description: 'OK' } },
      },
    },

    '/api/orgs': {
      get: {
        summary: 'List organizations',
        responses: {
          200: {
            description: 'List',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Organization' } } } },
          },
        },
      },
      post: {
        summary: 'Create organization',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
          },
        },
        responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Organization' } } } } },
      },
    },

    '/api/orgs/{id}': {
      get: {
        summary: 'Get organization by id (with projects)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
    },

    '/api/orgs/{id}/projects': {
      post: {
        summary: 'Create project under organization',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  archetype: { type: 'string' },
                  status: { type: 'string' },
                  spec: { type: 'object' },
                },
                required: ['name'],
              },
            },
          },
        },
        responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } } },
      },
    },

    '/api/projects': {
      get: {
        summary: 'List projects',
        parameters: [
          { name: 'orgId', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'offset', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'List',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create project (requires orgId)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orgId: { type: 'string' },
                  name: { type: 'string' },
                  archetype: { type: 'string' },
                  status: { type: 'string' },
                  spec: { type: 'object' },
                },
                required: ['orgId', 'name'],
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },

    '/api/projects/{id}': {
      get: {
        summary: 'Get project by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      put: {
        summary: 'Update project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { 200: { description: 'Updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        summary: 'Delete project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
  },
} as const;
