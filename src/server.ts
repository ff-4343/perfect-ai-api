import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./db.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true, credentials: true });

// صحة الخدمة
app.get("/health", async () => ({ ok: true, name: "Perfect AI API" }));

// قائمة المشاريع
app.get("/v1/projects", async () => {
  return prisma.project.findMany({
    select: { id: true, name: true, archetype: true, status: true, createdAt: true }
  });
});

// إنشاء مشروع
app.post("/v1/projects", async (req, reply) => {
  const body = req.body as any;
  const name = String(body?.name ?? "New Project");
  const archetype = String(body?.archetype ?? "saas");
  const spec = body?.spec ?? {};

  await prisma.organization.upsert({
    where: { id: "demo-org" },
    create: { id: "demo-org", name: "Demo Org" },
    update: {}
  });

  const created = await prisma.project.create({
    data: { orgId: "demo-org", name, archetype, status: "planning", spec }
  });

  return reply.code(201).send(created);
});

const port = Number(process.env.PORT ?? 3000);
app.listen({ port, host: "0.0.0.0" }).then(() => {
  app.log.info(`API listening on :${port}`);
});
