import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from './db.js';

async function build() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true, credentials: true });

  app.get('/health', async () => ({ ok: true, name: 'Perfect AI' }));

  app.get('/v1/projects', async () => {
    return prisma.project.findMany({
      select: { id: true, name: true, archetype: true, status: true, createdAt: true },
    });
  });

  app.post('/v1/projects', async (req, reply) => {
    const body = req.body as any;
    const created = await prisma.project.create({
      data: {
        orgId: 'demo-org',
        name: String(body?.name ?? 'New Project'),
        archetype: String(body?.archetype ?? 'saas'),
        status: 'planning',
        spec: body?.spec ?? {},
      },
    });
    return reply.code(201).send(created);
  });

  return app;
}

const port = Number(process.env.PORT || 3000);

build()
  .then((app) =>
    app.listen({ port, host: '0.0.0.0' }).then(() => {
      app.log.info(`API listening on :${port}`);
    })
  )
  .catch((err) => {
    console.error('Boot error:', err);
    process.exit(1);
  });
