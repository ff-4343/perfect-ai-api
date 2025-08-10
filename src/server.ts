import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import orgsRouter from './routes/orgs';
import projectsRouter from './routes/projects';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

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
