import { createApp } from './app.js';

const app = createApp();

const port = Number(process.env.PORT ?? 10000);
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`✅ Multi-tenant API Server listening on http://${host}:${port}`);
  console.log(`📚 API Documentation: http://${host}:${port}/docs`);
  console.log(`🔧 Admin Dashboard: http://${host}:${port}/admin`);
});
