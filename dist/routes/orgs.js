"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/orgs.ts
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// إنشاء منظمة
router.post('/', async (req, res, next) => {
    try {
        const { name } = req.body ?? {};
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'name is required' });
        }
        const org = await prisma_1.default.organization.create({ data: { name: name.trim() } });
        res.status(201).json(org);
    }
    catch (e) {
        next(e);
    }
});
// قائمة المنظمات
router.get('/', async (_req, res, next) => {
    try {
        const orgs = await prisma_1.default.organization.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(orgs);
    }
    catch (e) {
        next(e);
    }
});
// منظمة واحدة مع مشاريعها
router.get('/:id', async (req, res, next) => {
    try {
        const org = await prisma_1.default.organization.findUnique({
            where: { id: req.params.id },
            include: { projects: true },
        });
        if (!org)
            return res.status(404).json({ error: 'Not found' });
        res.json(org);
    }
    catch (e) {
        next(e);
    }
});
// إنشاء مشروع تحت منظمة
router.post('/:id/projects', async (req, res, next) => {
    try {
        const { name, archetype, status, spec } = req.body ?? {};
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'name is required' });
        }
        const project = await prisma_1.default.project.create({
            data: {
                orgId: req.params.id,
                name: name.trim(),
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
exports.default = router;
