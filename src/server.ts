import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import orgsRouter from './routes/orgs.js';
import projectsRouter from './routes/projects.js';

import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs.js';

const app = express();

// مهم لقراءة IP الحقيقي خلف الـ proxy على Render (للـ rate limit)
app.set('trust proxy', 1);

// CORS: لو CORS_ORIGIN موجودة نقيّد، وإلا نسمح للجميع
const allowed = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowed && allowed.length ? allowed : true }));

// Rate limit: 120 طلب/دقيقة لكل IP
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use(express.json({ limit: '1mb' }));

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 🔹 Swagger UI (قبل 404)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// 🔹 لوحة Admin بسيطة (قبل 404)
app.get('/admin', (_req, res) => {
  const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Admin — Orgs & Projects</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;padding:24px;max-width:900px;margin:0 auto;background:#0b0b0c;color:#e9eaee}
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
</style>
</head>
<body>
  <h1>Admin — Orgs & Projects</h1>

  <div class="card">
    <h2>Health</h2>
    <div id="health" class="muted">checking…</div>
  </div>

  <div class="card">
    <h2>Create Organization</h2>
    <div class="row">
      <input id="orgName" placeholder="Org name" />
      <button id="createOrgBtn">Create</button>
    </div>
    <div id="orgMsg" class="muted"></div>
  </div>

  <div class="card">
    <h2>Organizations</h2>
    <div class="row">
      <button id="reloadOrgsBtn">Reload</button>
      <select id="orgSelect"><option value="">-- choose org --</option></select>
    </div>
    <ul id="orgList"></ul>
  </div>

  <div class="card">
    <h2>Create Project</h2>
    <div class="row">
      <input id="projName" placeholder="Project name" />
      <button id="createProjBtn" disabled>Create</button>
    </div>
    <div id="projMsg" class="muted"></div>
  </div>

  <div class="card">
    <h2>Projects</h2>
    <ul id="projList"></ul>
  </div>

<script>
  const $ = (id) => document.getElementById(id);

  async function call(url, opts){
    const res = await fetch(url, opts || {});
    if(!res.ok){
      const txt = await res.text();
      throw new Error(txt || ('HTTP '+res.status));
    }
    return res.json ? res.json() : res.text();
  }

  async function checkHealth(){
    try{
      const data = await call('/health');
      $('health').textContent = (data && data.status) || 'ok';
      $('health').className = 'ok';
    }catch(e){
      $('health').textContent = e.message;
      $('health').className = 'err';
    }
  }

  async function loadOrgs(){
    $('orgList').innerHTML = '';
    $('orgSelect').innerHTML = '<option value="">-- choose org --</option>';
    try{
      const orgs = await call('/api/orgs');
      orgs.forEach(o=>{
        const li = document.createElement('li');
        li.textContent = o.name + '  (' + o.id + ')';
        $('orgList').appendChild(li);

        const opt = document.createElement('option');
        opt.value = o.id; opt.text = o.name;
        $('orgSelect').appendChild(opt);
      });
    }catch(e){
      $('orgList').innerHTML = '<li class="err">'+e.message+'</li>';
    }
    onOrgChange();
  }

  async function onOrgChange(){
    const id = $('orgSelect').value;
    $('createProjBtn').disabled = !id;
    $('projList').innerHTML = '';
    if(!id) return;
    try{
      const data = await call('/api/projects?orgId=' + encodeURIComponent(id));
      const ps = data.items || data; // Handle both direct array and paginated response
      ps.forEach(p=>{
        const li = document.createElement('li');
        li.textContent = p.name + ' — ' + (p.status || 'planning');
        $('projList').appendChild(li);
      });
    }catch(e){
      $('projList').innerHTML = '<li class="err">'+e.message+'</li>';
    }
  }

  async function createOrg(){
    const name = $('orgName').value.trim();
    if(!name){ $('orgMsg').textContent='Enter org name'; return; }
    $('createOrgBtn').disabled = true;
    $('orgMsg').textContent = 'Creating...';
    try{
      await call('/api/orgs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
      $('orgName').value='';
      $('orgMsg').textContent='Created';
      loadOrgs();
    }catch(e){
      $('orgMsg').textContent = e.message; $('orgMsg').className='err';
    }finally{
      $('createOrgBtn').disabled = false;
    }
  }

  async function createProj(){
    const orgId = $('orgSelect').value;
    const name = $('projName').value.trim();
    if(!orgId){ $('projMsg').textContent='Choose org'; return; }
    if(!name){ $('projMsg').textContent='Enter project name'; return; }
    $('createProjBtn').disabled = true;
    $('projMsg').textContent = 'Creating...';
    try{
      await call('/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orgId,name})});
      $('projName').value='';
      $('projMsg').textContent='Created';
      onOrgChange();
    }catch(e){
      $('projMsg').textContent = e.message; $('projMsg').className='err';
    }finally{
      $('createProjBtn').disabled = !$('orgSelect').value;
    }
  }

  $('reloadOrgsBtn').onclick = loadOrgs;
  $('createOrgBtn').onclick = createOrg;
  $('createProjBtn').onclick = createProj;
  $('orgSelect').onchange = onOrgChange;

  checkHealth();
  loadOrgs();
</script>
</body>
</html>
  `;
  res.type('text/html').send(html);
});

// API Routers
app.use('/api/orgs', orgsRouter);
app.use('/api/projects', projectsRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = Number(process.env.PORT ?? 10000);
const host = '0.0.0.0';
app.listen(port, host, () => {
  console.log(`✅ Server listening on http://${host}:${port}`);
});
