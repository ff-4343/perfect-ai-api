import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import orgsRouter from './routes/orgs';
import projectsRouter from './routes/projects';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './docs';

const app = express();

// CORS: لو حددت CORS_ORIGIN في env (قائمة مفصولة بفواصل) هنقيّد الوصول، وإلا نسمح للجميع
const allowed = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowed && allowed.length ? allowed : true }));

// Rate limit: 120 طلب/دقيقة لكل IP
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Routers
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
