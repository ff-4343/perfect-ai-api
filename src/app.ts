// src/app.ts
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { prisma } from './db.js';
import { TenantService } from './services/tenant.service.js';
import { createTenantMiddleware, createOptionalTenantMiddleware, withTenant } from './middleware/tenant.middleware.js';

// Import existing routes
import orgsRouter from './routes/orgs.js';
import projectsRouter from './routes/projects.js';

import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs.js';

const app = express();

// Trust proxy for real IP detection behind proxies (e.g., Render)
app.set('trust proxy', 1);

// CORS: Allow specific origins if CORS_ORIGIN is set, otherwise allow all
const allowed = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowed && allowed.length ? allowed : true }));

// Rate limit: 120 requests per minute per IP
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use(express.json({ limit: '1mb' }));

// Initialize services
const tenantService = new TenantService(prisma);

// ===== HEALTH & SYSTEM ENDPOINTS =====
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ===== TENANT MANAGEMENT ENDPOINTS =====

/**
 * Bootstrap a new tenant
 * POST /api/tenants/bootstrap
 */
app.post('/api/tenants/bootstrap', async (req: Request, res: Response) => {
  try {
    const { name, slug, domain, plan = 'basic', adminUser } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and slug are required'
      });
    }

    if (!adminUser || !adminUser.email) {
      return res.status(400).json({
        error: 'Admin user required',
        message: 'adminUser.email is required'
      });
    }

    // Create the tenant
    const tenant = await tenantService.createTenant({ name, slug, domain, plan });

    // Bootstrap with initial data
    await tenantService.bootstrapTenant(tenant.id, adminUser);

    res.status(201).json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        plan: tenant.plan,
        status: tenant.status
      },
      message: 'Tenant created and bootstrapped successfully'
    });
  } catch (error: any) {
    console.error('Tenant bootstrap error:', error);
    res.status(400).json({
      error: 'Failed to bootstrap tenant',
      message: error.message || 'Unknown error occurred'
    });
  }
});

/**
 * List all tenants
 * GET /api/tenants
 */
app.get('/api/tenants', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await tenantService.listTenants(page, limit);
    
    res.json({
      success: true,
      ...result,
      pagination: {
        currentPage: page,
        totalPages: result.pages,
        totalItems: result.total,
        hasNext: page < result.pages,
        hasPrev: page > 1
      }
    });
  } catch (error: any) {
    console.error('List tenants error:', error);
    res.status(500).json({
      error: 'Failed to list tenants',
      message: error.message
    });
  }
});

/**
 * Get tenant by slug
 * GET /api/tenants/:slug
 */
app.get('/api/tenants/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const tenant = await tenantService.getTenantBySlug(slug);

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant with slug '${slug}' not found`
      });
    }

    // Get tenant statistics
    const stats = await tenantService.getTenantStats(tenant.id);

    res.json({
      success: true,
      tenant,
      stats
    });
  } catch (error: any) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      error: 'Failed to get tenant',
      message: error.message
    });
  }
});

/**
 * Update tenant
 * PUT /api/tenants/:slug
 */
app.put('/api/tenants/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const updates = req.body;

    // First find the tenant
    const existingTenant = await tenantService.getTenantBySlug(slug);
    if (!existingTenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant with slug '${slug}' not found`
      });
    }

    // Update the tenant
    const tenant = await tenantService.updateTenant(existingTenant.id, updates);

    res.json({
      success: true,
      tenant,
      message: 'Tenant updated successfully'
    });
  } catch (error: any) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      error: 'Failed to update tenant',
      message: error.message
    });
  }
});

// ===== SWAGGER DOCUMENTATION =====
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// ===== ADMIN PANEL =====
app.get('/admin', (_req, res) => {
  const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Multi-Tenant Admin — Perfect AI API</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;padding:24px;max-width:1200px;margin:0 auto;background:#0b0b0c;color:#e9eaee}
  h1,h2{margin:0 0 12px}
  .card{background:#141519;border:1px solid #1f2230;border-radius:10px;padding:16px;margin:16px 0}
  input,select,button,textarea{padding:10px 12px;border-radius:8px;border:1px solid #2a2f40;background:#0f1117;color:#e9eaee}
  button{cursor:pointer;background:#2b66ff;border-color:#2b66ff}
  button:disabled{opacity:.5;cursor:not-allowed}
  .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .col{display:flex;flex-direction:column;gap:8px}
  ul{margin:8px 0 0 18px}
  .muted{opacity:.7;font-size:14px}
  .ok{color:#7dff9a}
  .err{color:#ff8080;white-space:pre-wrap}
  .tenant-card{background:#1a1a1f;border:1px solid #2a2a3a;padding:12px;margin:8px 0;border-radius:6px}
  .tenant-header{font-weight:bold;margin-bottom:8px}
  .tenant-meta{font-size:13px;opacity:0.8}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:8px;margin-top:8px}
  .stat{text-align:center;background:#0f0f14;padding:8px;border-radius:4px}
  .stat-value{font-size:18px;font-weight:bold;color:#7dff9a}
  .stat-label{font-size:11px;opacity:0.7}
  textarea{min-height:100px;font-family:monospace}
</style>
</head>
<body>
  <h1>Multi-Tenant Admin — Perfect AI API</h1>

  <div class="card">
    <h2>Health Check</h2>
    <div id="health" class="muted">checking…</div>
  </div>

  <div class="card">
    <h2>Bootstrap New Tenant</h2>
    <div class="col">
      <div class="row">
        <input id="tenantName" placeholder="Organization name" style="flex:1" />
        <input id="tenantSlug" placeholder="slug (lowercase-with-dashes)" style="flex:1" />
      </div>
      <div class="row">
        <input id="tenantDomain" placeholder="custom domain (optional)" style="flex:1" />
        <select id="tenantPlan">
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div class="row">
        <input id="adminEmail" placeholder="Admin email" type="email" style="flex:1" />
        <input id="adminName" placeholder="Admin name" style="flex:1" />
      </div>
      <button id="bootstrapBtn">Bootstrap Tenant</button>
    </div>
    <div id="bootstrapMsg" class="muted"></div>
  </div>

  <div class="card">
    <h2>Tenants</h2>
    <div class="row">
      <button id="reloadTenantsBtn">Reload Tenants</button>
      <span class="muted" id="tenantCount">0 tenants</span>
    </div>
    <div id="tenantsList"></div>
  </div>

  <div class="card">
    <h2>Test Tenant API</h2>
    <div class="col">
      <div class="row">
        <select id="testTenant"><option value="">Select a tenant...</option></select>
        <input id="testEndpoint" placeholder="/api/projects" style="flex:1" />
        <select id="testMethod">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <button id="testBtn">Test</button>
      </div>
      <textarea id="testBody" placeholder="Request body (JSON)"></textarea>
      <div id="testResult" class="muted"></div>
    </div>
  </div>

<script>
  const $ = (id) => document.getElementById(id);

  async function call(url, opts = {}) {
    const res = await fetch(url, opts);
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

  async function bootstrapTenant() {
    const name = $('tenantName').value.trim();
    const slug = $('tenantSlug').value.trim();
    const domain = $('tenantDomain').value.trim();
    const plan = $('tenantPlan').value;
    const adminEmail = $('adminEmail').value.trim();
    const adminName = $('adminName').value.trim();

    if (!name || !slug || !adminEmail) {
      $('bootstrapMsg').textContent = 'Name, slug, and admin email are required';
      $('bootstrapMsg').className = 'err';
      return;
    }

    $('bootstrapBtn').disabled = true;
    $('bootstrapMsg').textContent = 'Bootstrapping tenant...';
    $('bootstrapMsg').className = 'muted';

    try {
      const result = await call('/api/tenants/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          domain: domain || undefined,
          plan,
          adminUser: { email: adminEmail, name: adminName || undefined }
        })
      });

      $('tenantName').value = '';
      $('tenantSlug').value = '';
      $('tenantDomain').value = '';
      $('adminEmail').value = '';
      $('adminName').value = '';
      
      $('bootstrapMsg').textContent = 'Tenant bootstrapped successfully!';
      $('bootstrapMsg').className = 'ok';
      
      loadTenants();
    } catch (e) {
      $('bootstrapMsg').textContent = e.message;
      $('bootstrapMsg').className = 'err';
    } finally {
      $('bootstrapBtn').disabled = false;
    }
  }

  async function loadTenants() {
    $('tenantsList').innerHTML = 'Loading...';
    $('testTenant').innerHTML = '<option value="">Select a tenant...</option>';
    
    try {
      const result = await call('/api/tenants');
      const tenants = result.tenants || [];
      
      $('tenantCount').textContent = tenants.length + ' tenants';
      
      if (tenants.length === 0) {
        $('tenantsList').innerHTML = '<div class="muted">No tenants yet. Bootstrap your first tenant above.</div>';
        return;
      }

      let html = '';
      tenants.forEach(tenant => {
        html += \`
          <div class="tenant-card">
            <div class="tenant-header">\${tenant.name} (\${tenant.slug})</div>
            <div class="tenant-meta">
              Plan: \${tenant.plan} | Status: \${tenant.status}
              \${tenant.domain ? \`| Domain: \${tenant.domain}\` : ''}
            </div>
            <div class="stats">
              <div class="stat"><div class="stat-value">-</div><div class="stat-label">Users</div></div>
              <div class="stat"><div class="stat-value">-</div><div class="stat-label">Projects</div></div>
              <div class="stat"><div class="stat-value">-</div><div class="stat-label">Products</div></div>
              <div class="stat"><div class="stat-value">-</div><div class="stat-label">Orders</div></div>
            </div>
          </div>
        \`;

        const opt = document.createElement('option');
        opt.value = tenant.slug;
        opt.text = tenant.name + ' (' + tenant.slug + ')';
        $('testTenant').appendChild(opt);
      });
      
      $('tenantsList').innerHTML = html;
    } catch (e) {
      $('tenantsList').innerHTML = '<div class="err">' + e.message + '</div>';
    }
  }

  async function testTenantAPI() {
    const tenantSlug = $('testTenant').value;
    const endpoint = $('testEndpoint').value.trim();
    const method = $('testMethod').value;
    const body = $('testBody').value.trim();

    if (!tenantSlug || !endpoint) {
      $('testResult').textContent = 'Please select a tenant and enter an endpoint';
      $('testResult').className = 'err';
      return;
    }

    $('testBtn').disabled = true;
    $('testResult').textContent = 'Testing...';
    $('testResult').className = 'muted';

    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': tenantSlug
        }
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        opts.body = body;
      }

      const result = await call(endpoint, opts);
      $('testResult').textContent = JSON.stringify(result, null, 2);
      $('testResult').className = 'ok';
    } catch (e) {
      $('testResult').textContent = e.message;
      $('testResult').className = 'err';
    } finally {
      $('testBtn').disabled = false;
    }
  }

  $('bootstrapBtn').onclick = bootstrapTenant;
  $('reloadTenantsBtn').onclick = loadTenants;
  $('testBtn').onclick = testTenantAPI;

  // Auto-generate slug from name
  $('tenantName').oninput = () => {
    const name = $('tenantName').value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    $('tenantSlug').value = slug;
  };

  checkHealth();
  loadTenants();
</script>
</body>
</html>
  `;
  res.type('text/html').send(html);
});

// ===== TENANT-SCOPED ROUTES =====

// Apply optional tenant middleware to existing routes
const optionalTenantMiddleware = createOptionalTenantMiddleware(prisma);

// Apply tenant middleware to specific tenant-scoped API routes
const tenantMiddleware = createTenantMiddleware(prisma);

// Existing routes with optional tenant context
app.use('/api/orgs', optionalTenantMiddleware, orgsRouter);
app.use('/api/projects', optionalTenantMiddleware, projectsRouter);

// ===== TENANT-SCOPED ENDPOINTS =====

// Example: Get tenant users
app.get('/tenant/:tenantSlug/users', 
  createTenantMiddleware(prisma, { slugParam: 'tenantSlug' }),
  withTenant(async (req: Request, res: Response) => {
    try {
      const users = await req.tenantPrisma!.users.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        tenant: req.tenant!.slug,
        users
      });
    } catch (error: any) {
      console.error('Get tenant users error:', error);
      res.status(500).json({
        error: 'Failed to get users',
        message: error.message
      });
    }
  })
);

// Example: Get tenant projects
app.get('/tenant/:tenantSlug/projects', 
  createTenantMiddleware(prisma, { slugParam: 'tenantSlug' }),
  withTenant(async (req: Request, res: Response) => {
    try {
      const projects = await req.tenantPrisma!.projects.findMany();

      res.json({
        success: true,
        tenant: req.tenant!.slug,
        projects
      });
    } catch (error: any) {
      console.error('Get tenant projects error:', error);
      res.status(500).json({
        error: 'Failed to get projects',
        message: error.message
      });
    }
  })
);

// ===== ERROR HANDLERS =====

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;