import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Create
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body ?? {};
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'name is required (non-empty string)' });
    }
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: typeof description === 'string' ? description : null,
      },
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// List
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const take = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 100);
    const skip = parseInt(String(req.query.offset ?? '0'), 10) || 0;
    const items = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    const total = await prisma.project.count();
    res.json({ items, total });
  } catch (err) {
    next(err);
  }
});

// Get by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// Update
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body ?? {};
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'name must be a non-empty string' });
    }
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(description !== undefined ? { description: description as string | null } : {}),
      },
    });
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(err);
  }
});

// Delete
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(err);
  }
});

export default router;
