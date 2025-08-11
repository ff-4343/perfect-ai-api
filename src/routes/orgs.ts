import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// إنشاء منظمة
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body ?? {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const org = await prisma.organization.create({ data: { name: name.trim() } });
    res.status(201).json(org);
  } catch (e) { next(e); }
});

// قائمة المنظمات
router.get('/', async (_req, res, next) => {
  try {
    const orgs = await prisma.organization.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(orgs);
  } catch (e) { next(e); }
});

// منظمة واحدة مع مشاريعها
router.get('/:id', async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { projects: true },
    });
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  } catch (e) { next(e); }
});

// إنشاء مشروع تحت منظمة
router.post('/:id/projects', async (req, res, next) => {
  try {
    const { name, archetype, status, spec } = req.body ?? {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    const project = await prisma.project.create({
      data: {
        orgId: req.params.id,
        name: name.trim(),
        archetype: String(archetype ?? ''),
        status: String(status ?? 'planning'),
        spec: spec ?? {},
      },
    });
    res.status(201).json(project);
  } catch (e: any) {
    if (e?.code === 'P2003') return res.status(404).json({ error: 'Organization not found' });
    next(e);
  }
});

export default router;
