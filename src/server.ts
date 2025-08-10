import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from './db.js';

export async function createApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true, credentials: true });

  app.get('/health', async () => ({ ok: true, name: 'Perfect AI API' }));

  app.get('/v1/projects', async () => {
    return prisma.project.findMany({
      select: { id: true, name: true, archetype: true, status: true, createdAt: true }
    });
  });

  app.post('/v1/projects', async (req, reply) => {
    const body = (req.body ?? {}) as any;
    const name = String(body?.name ?? 'New Project');
    const archetype = String(body?.archetype ?? 'saas');
    const spec = (body?.spec ?? {}) as any;

    await prisma.organization.upsert({
      where: { id: 'demo-org' },
      update: {},
      create: { id: 'demo-org', name: 'Demo Org' }
    });

    const created = await prisma.project.create({
      data: { orgId: 'demo-org', name, archetype, status: 'planning', spec }
    });

    return reply.code(201).send(created);
  });

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3000);
  const host = '0.0.0.0';
  try {
    await app.listen({ port, host });
    app.log.info(`API listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
