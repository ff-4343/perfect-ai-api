// src/server.ts - Server entry point for multi-tenant API
import 'dotenv/config';
import app from './app.js';
import { connectDB } from './db.js';

const port = Number(process.env.PORT ?? 3000);
const host = '0.0.0.0';

async function startServer() {
  try {
    // Connect to database
    await connectDB();
    console.log('🔗 Database connected successfully');
    
    // Start the server
    app.listen(port, host, () => {
      console.log(`✅ Multi-tenant API server listening on http://${host}:${port}`);
      console.log(`📖 API Documentation: http://${host}:${port}/docs`);
      console.log(`🎛️  Admin Panel: http://${host}:${port}/admin`);
      console.log('');
      console.log('🏢 Multi-tenant features:');
      console.log('   • Tenant bootstrap: POST /api/tenants/bootstrap');
      console.log('   • Tenant management: GET /api/tenants');
      console.log('   • Header-based resolution: x-tenant-slug');
      console.log('   • Subdomain resolution: tenant.domain.com');
      console.log('   • Route-based resolution: /tenant/:slug/endpoint');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

startServer();
