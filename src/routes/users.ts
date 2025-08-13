// src/routes/users.ts
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// قائمة المستخدمين
router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (e) { 
    next(e); 
  }
});

// إنشاء مستخدم جديد
router.post('/', async (req, res, next) => {
  try {
    const { email, name } = req.body ?? {};
    
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'email is required' });
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const user = await prisma.user.create({ 
      data: { 
        email: email.trim(), 
        name: name ? String(name).trim() : null 
      } 
    });
    
    res.status(201).json(user);
  } catch (e: any) {
    // التعامل مع خطأ البريد الإلكتروني المكرر
    if (e?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e); 
  }
});

// الحصول على مستخدم واحد
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (e) { 
    next(e); 
  }
});

// تحديث مستخدم
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const { email, name } = req.body ?? {};
    const updateData: any = {};
    
    if (email !== undefined) {
      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'email cannot be empty' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      updateData.email = email.trim();
    }
    
    if (name !== undefined) {
      updateData.name = name ? String(name).trim() : null;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    res.json(user);
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (e?.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e); 
  }
});

// حذف مستخدم
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e); 
  }
});

export default router;