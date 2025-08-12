// src/routes/projects.ts
import { Router } from 'express';
import prisma from '../lib/prisma.js';
const router = Router();
// إنشاء مشروع (يتطلب orgId)
router.post('/', async (req, res, next) => {
    try {
        const { orgId, name, archetype, status, spec } = req.body ?? {};
        if (!orgId || !name)
            return res.status(400).json({ error: 'orgId and name are required' });
        const project = await prisma.project.create({
            data: {
                orgId: String(orgId),
                name: String(name).trim(),
                archetype: String(archetype ?? ''),
                status: String(status ?? 'planning'),
                spec: spec ?? {},
            },
        });
        res.status(201).json(project);
    }
    catch (e) {
        if (e?.code === 'P2003')
            return res.status(404).json({ error: 'Organization not found' });
        next(e);
    }
});
// قائمة المشاريع (فلتر اختياري orgId + pagination)
router.get('/', async (req, res, next) => {
    try {
        const orgId = req.query.orgId ? String(req.query.orgId) : undefined;
        const take = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 100);
        const skip = parseInt(String(req.query.offset ?? '0'), 10) || 0;
        const where = orgId ? { orgId } : {};
        const [items, total] = await Promise.all([
            prisma.project.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
            prisma.project.count({ where }),
        ]);
        res.json({ items, total });
    }
    catch (e) {
        next(e);
    }
});
// مشروع واحد
router.get('/:id', async (req, res, next) => {
    try {
        const item = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!item)
            return res.status(404).json({ error: 'Not found' });
        res.json(item);
    }
    catch (e) {
        next(e);
    }
});
// تحديث
router.put('/:id', async (req, res, next) => {
    try {
        const { name, archetype, status, spec } = req.body ?? {};
        const updated = await prisma.project.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined ? { name: String(name).trim() } : {}),
                ...(archetype !== undefined ? { archetype: String(archetype) } : {}),
                ...(status !== undefined ? { status: String(status) } : {}),
                ...(spec !== undefined ? { spec } : {}),
            },
        });
        res.json(updated);
    }
    catch (e) {
        if (e?.code === 'P2025')
            return res.status(404).json({ error: 'Not found' });
        next(e);
    }
});
// حذف
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.status(204).end();
    }
    catch (e) {
        if (e?.code === 'P2025')
            return res.status(404).json({ error: 'Not found' });
        next(e);
    }
});
export default router;
