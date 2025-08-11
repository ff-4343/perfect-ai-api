import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { tenantMiddleware, optionalTenantMiddleware } from './middleware/tenant.middleware.js';
import { tenantService } from './services/tenant.service.js';
import { prismaService } from './services/prisma.service.js';

// Import existing routes
import orgsRouter from './routes/orgs.js';
import projectsRouter from './routes/projects.js';

import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs.js';

export function createApp() {
  const app = express();

  // مهم لقراءة IP الحقيقي خلف الـ proxy على Render (للـ rate limit)
  app.set('trust proxy', 1);

  // CORS: لو CORS_ORIGIN موجودة نقيّد، وإلا نسمح للجميع
  const allowed = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors({ origin: allowed && allowed.length ? allowed : true }));

  // Rate limit: 120 طلب/دقيقة لكل IP
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));

  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Swagger UI documentation
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Admin dashboard (existing functionality)
  app.get('/admin', (_req, res) => {
    const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Admin — Multi-Tenant API</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;padding:24px;max-width:1200px;margin:0 auto;background:#0b0b0c;color:#e9eaee}
  h1,h2{margin:0 0 12px}
  .card{background:#141519;border:1px solid #1f2230;border-radius:10px;padding:16px;margin:16px 0}
  input,select,button{padding:10px 12px;border-radius:8px;border:1px solid #2a2f40;background:#0f1117;color:#e9eaee}
  button{cursor:pointer;background:#2b66ff;border-color:#2b66ff}
  button:disabled{opacity:.5;cursor:not-allowed}
  .row{display:flex;gap:8px;flex-wrap:wrap}
  ul{margin:8px 0 0 18px}
  .muted{opacity:.7}
  .ok{color:#7dff9a}
  .err{color:#ff8080;white-space:pre-wrap}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
</style>
</head>
<body>
  <h1>Multi-Tenant API Admin</h1>

  <div class="grid">
    <div class="card">
      <h2>Health</h2>
      <div id="health" class="muted">checking…</div>
    </div>

    <div class="card">
      <h2>Tenant Management</h2>
      <div class="row">
        <input id="tenantId" placeholder="Tenant ID (e.g., company-abc)" />
        <input id="tenantName" placeholder="Tenant Name" />
        <button id="createTenantBtn">Create Tenant</button>
      </div>
      <div id="tenantMsg" class="muted"></div>
    </div>

    <div class="card">
      <h2>Prisma Cache Stats</h2>
      <div id="cacheStats" class="muted">loading…</div>
      <button id="refreshCacheBtn">Refresh</button>
    </div>
  </div>

  <div class="card">
    <h2>Create Organization</h2>
    <div class="row">
      <input id="orgTenantId" placeholder="Tenant ID" />
      <input id="orgName" placeholder="Org name" />
      <button id="createOrgBtn">Create</button>
    </div>
    <div id="orgMsg" class="muted"></div>
  </div>

  <div class="card">
    <h2>Test Tenant User Creation</h2>
    <div class="row">
      <input id="userTenantId" placeholder="Tenant ID" />
      <input id="userEmail" placeholder="User Email" />
      <input id="userName" placeholder="User Name" />
      <button id="createUserBtn">Create User</button>
    </div>
    <div id="userMsg" class="muted"></div>
  </div>

<script>
  const $ = (id) => document.getElementById(id);

  async function call(url, opts) {
    const res = await fetch(url, opts || {});
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || ('HTTP ' + res.status));
    }
    return res.json ? res.json() : res.text();
  }

  async function checkHealth() {
    try {
      const data = await call('/health');
      $('health').textContent = (data && data.status) || 'ok';
      $('health').className = 'ok';
    } catch (e) {
      $('health').textContent = e.message;
      $('health').className = 'err';
    }
  }

  async function createTenant() {
    const tenantId = $('tenantId').value.trim();
    const tenantName = $('tenantName').value.trim();
    if (!tenantId || !tenantName) {
      $('tenantMsg').textContent = 'Enter both tenant ID and name';
      return;
    }
    
    $('createTenantBtn').disabled = true;
    $('tenantMsg').textContent = 'Creating...';
    
    try {
      const result = await call('/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, tenantName })
      });
      $('tenantId').value = '';
      $('tenantName').value = '';
      $('tenantMsg').textContent = 'Tenant created successfully';
      $('tenantMsg').className = 'ok';
    } catch (e) {
      $('tenantMsg').textContent = e.message;
      $('tenantMsg').className = 'err';
    } finally {
      $('createTenantBtn').disabled = false;
    }
  }

  async function refreshCacheStats() {
    try {
      const stats = await call('/tenants/cache-stats');
      $('cacheStats').innerHTML = 
        'Total cached clients: ' + stats.totalClients + '<br>' +
        'Cached tenants: ' + (stats.tenants.length ? stats.tenants.join(', ') : 'none');
      $('cacheStats').className = 'ok';
    } catch (e) {
      $('cacheStats').textContent = e.message;
      $('cacheStats').className = 'err';
    }
  }

  async function createOrg() {
    const tenantId = $('orgTenantId').value.trim();
    const name = $('orgName').value.trim();
    if (!tenantId || !name) {
      $('orgMsg').textContent = 'Enter both tenant ID and org name';
      return;
    }
    
    $('createOrgBtn').disabled = true;
    $('orgMsg').textContent = 'Creating...';
    
    try {
      await call('/api/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({ name })
      });
      $('orgName').value = '';
      $('orgMsg').textContent = 'Organization created successfully';
      $('orgMsg').className = 'ok';
    } catch (e) {
      $('orgMsg').textContent = e.message;
      $('orgMsg').className = 'err';
    } finally {
      $('createOrgBtn').disabled = false;
    }
  }

  async function createUser() {
    const tenantId = $('userTenantId').value.trim();
    const email = $('userEmail').value.trim();
    const name = $('userName').value.trim();
    if (!tenantId || !email) {
      $('userMsg').textContent = 'Enter tenant ID and email';
      return;
    }
    
    $('createUserBtn').disabled = true;
    $('userMsg').textContent = 'Creating...';
    
    try {
      await call('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({ email, name })
      });
      $('userEmail').value = '';
      $('userName').value = '';
      $('userMsg').textContent = 'User created successfully';
      $('userMsg').className = 'ok';
    } catch (e) {
      $('userMsg').textContent = e.message;
      $('userMsg').className = 'err';
    } finally {
      $('createUserBtn').disabled = false;
    }
  }

  $('createTenantBtn').onclick = createTenant;
  $('refreshCacheBtn').onclick = refreshCacheStats;
  $('createOrgBtn').onclick = createOrg;
  $('createUserBtn').onclick = createUser;

  checkHealth();
  refreshCacheStats();
</script>
</body>
</html>
    `;
    res.type('text/html').send(html);
  });

  // ===== TENANT MANAGEMENT ENDPOINTS =====

  /**
   * POST /tenants - Create a new tenant
   */
  app.post('/tenants', async (req, res) => {
    try {
      const { tenantId, tenantName } = req.body;

      if (!tenantId || !tenantName) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Both tenantId and tenantName are required'
        });
      }

      const tenant = await tenantService.createTenant(tenantId, tenantName);
      res.status(201).json(tenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({
        error: 'Failed to create tenant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /tenants/:tenantId - Get tenant information
   */
  app.get('/tenants/:tenantId', async (req, res) => {
    try {
      const { tenantId } = req.params;
      const tenant = await tenantService.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          message: `Tenant '${tenantId}' does not exist`
        });
      }

      res.json(tenant);
    } catch (error) {
      console.error('Error getting tenant:', error);
      res.status(500).json({
        error: 'Failed to get tenant',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /tenants/cache-stats - Get Prisma cache statistics
   */
  app.get('/tenants/cache-stats', (_req, res) => {
    try {
      const stats = prismaService.getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting cache stats:', error);
      res.status(500).json({
        error: 'Failed to get cache stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== TENANT-SCOPED ENDPOINTS =====

  /**
   * GET /users - List users for a tenant
   */
  app.get('/users', tenantMiddleware, async (req, res) => {
    try {
      const users = await req.prisma!.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      res.json({
        tenantId: req.tenantId,
        users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /users - Create a user for a tenant
   */
  app.post('/users', tenantMiddleware, async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'Email is required'
        });
      }

      const user = await req.prisma!.user.create({
        data: {
          email,
          name: name || null
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      res.status(201).json({
        tenantId: req.tenantId,
        user
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== EXISTING API ROUTES (now tenant-aware) =====
  app.use('/api/orgs', tenantMiddleware, orgsRouter);
  app.use('/api/projects', tenantMiddleware, projectsRouter);

  // 404 handler
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}