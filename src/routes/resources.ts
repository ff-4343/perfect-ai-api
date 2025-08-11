// src/routes/resources.ts
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/resources?orgId=&projectId=&kind=&status=&limit=&offset=
router.get('/', async (req, res, next) => {
  try {
    const orgId = req.query.orgId ? String(req.query.orgId) : undefined;
    const projectId = req.query.projectId ? String(req.query.projectId) : undefined;
    const kind = req.query.kind ? String(req.query.kind) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const take = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 100);
    const skip = parseInt(String(req.query.offset ?? '0'), 10) || 0;

    const where: any = {};
    if (orgId) where.orgId = orgId;
    if (projectId) where.projectId = projectId;
    if (kind) where.kind = kind;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
      prisma.resource.count({ where }),
    ]);

    res.json({ items, total });
  } catch (e) { next(e); }
});

// POST /api/resources  { orgId?, projectId?, kind, key?, status?, data }
router.post('/', async (req, res, next) => {
  try {
    const { orgId, projectId, kind, key, status, data } = req.body ?? {};
    if (!kind || !data) return res.status(400).json({ error: 'kind and data are required' });

    const r = await prisma.resource.create({
      data: { orgId: orgId ?? null, projectId: projectId ?? null, kind, key: key ?? null, status: status ?? null, data },
    });
    res.status(201).json(r);
  } catch (e: any) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Resource key already exists for this scope' });
    next(e);
  }
});

export default router;