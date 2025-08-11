// src/routes/services.ts
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/services?orgId=
router.get('/', async (req, res, next) => {
  try {
    const orgId = req.query.orgId ? String(req.query.orgId) : undefined;
    const where = orgId ? { orgId, active: true } : { active: true };
    const services = await prisma.service.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json(services);
  } catch (e) { next(e); }
});

// POST /api/services  (اختياري للأدمن)
router.post('/', async (req, res, next) => {
  try {
    const { orgId, slug, name, description, priceFrom, sortOrder, active } = req.body ?? {};
    if (!slug || !name) return res.status(400).json({ error: 'slug and name are required' });
    const s = await prisma.service.create({
      data: { orgId: orgId ?? null, slug, name, description, priceFrom, sortOrder, active },
    });
    res.status(201).json(s);
  } catch (e: any) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Duplicate slug for this org' });
    next(e);
  }
});

// PATCH /api/services/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const s = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
    res.json(s);
  } catch (e: any) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

export default router;