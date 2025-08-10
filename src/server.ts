import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check لـ Render
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('ok');
  } catch {
    res.status(500).send('db-error');
  }
});

// راوت بسيط للتجربة
app.get('/', (_req, res) => res.send('Perfect API up'));

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

// إغلاق نظيف
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
