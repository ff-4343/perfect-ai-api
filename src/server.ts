// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, prisma, disconnectDB } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.status(200).send('ok'));
app.get('/', (_req, res) => res.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3000; // على Render يمرر PORT تلقائياً

app.listen(port, '0.0.0.0', async () => {
  await connectDB();
  console.log(`✅ Server listening on http://0.0.0.0:${port}`);
});

// إغلاق نظيف
process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
