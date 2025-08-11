// src/routes/contact.ts
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// POST /api/contact  { name, email, phone?, message, budget?, orgId?, serviceSlug? }
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, message, budget, orgId, serviceSlug, source } = req.body ?? {};
    if (!name || !email || !message) return res.status(400).json({ error: 'name, email, message are required' });

    let serviceId: string | null = null;
    if (serviceSlug) {
      const s = await prisma.service.findFirst({ where: { slug: String(serviceSlug), orgId: orgId ?? null } });
      serviceId = s?.id ?? null;
    }

    const lead = await prisma.lead.create({
      data: { name, email, phone, message, budget, orgId: orgId ?? null, serviceId, source },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    res.status(201).json({ ok: true, lead });
  } catch (e) { next(e); }
});

// GET /api/contact?orgId=&status=
router.get('/', async (req, res, next) => {
  try {
    const orgId = req.query.orgId ? String(req.query.orgId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const where: any = {};
    if (orgId) where.orgId = orgId;
    if (status) where.status = status;

    const items = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true, budget: true,
        message: true, status: true, createdAt: true, serviceId: true, orgId: true
      }
    });
    res.json(items);
  } catch (e) { next(e); }
});

export default router;