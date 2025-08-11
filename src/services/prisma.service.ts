import { PrismaClient } from '@prisma/client';
import { tenantService } from './tenant.service.js';

export class PrismaService {
  private clientCache = new Map<string, PrismaClient>();
  private cleanupIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Get or create a Prisma client for a specific tenant
   */
  async getClient(tenantId: string): Promise<PrismaClient> {
    // Check if we already have a cached client
    if (this.clientCache.has(tenantId)) {
      const client = this.clientCache.get(tenantId)!;
      
      // Extend the cleanup timer for this client
      this.resetCleanupTimer(tenantId);
      
      return client;
    }

    // Get tenant information to build database URL
    const tenant = await tenantService.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Create new Prisma client for this tenant
    const client = new PrismaClient({
      datasources: {
        db: { url: tenant.databaseUrl }
      }
    });

    // Test the connection
    try {
      await client.$connect();
    } catch (error) {
      await client.$disconnect();
      throw new Error(`Failed to connect to tenant ${tenantId} database: ${error}`);
    }

    // Cache the client
    this.clientCache.set(tenantId, client);
    
    // Set cleanup timer (remove client after 5 minutes of inactivity)
    this.resetCleanupTimer(tenantId);

    console.log(`✅ Created Prisma client for tenant: ${tenantId}`);
    return client;
  }

  /**
   * Remove a client from cache and disconnect it
   */
  async removeClient(tenantId: string): Promise<void> {
    const client = this.clientCache.get(tenantId);
    if (client) {
      await client.$disconnect();
      this.clientCache.delete(tenantId);
      
      // Clear cleanup timer
      const timer = this.cleanupIntervals.get(tenantId);
      if (timer) {
        clearTimeout(timer);
        this.cleanupIntervals.delete(tenantId);
      }
      
      console.log(`🧹 Removed Prisma client for tenant: ${tenantId}`);
    }
  }

  /**
   * Get all cached tenant IDs
   */
  getCachedTenants(): string[] {
    return Array.from(this.clientCache.keys());
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalClients: number; tenants: string[] } {
    return {
      totalClients: this.clientCache.size,
      tenants: this.getCachedTenants()
    };
  }

  /**
   * Disconnect all cached clients
   */
  async disconnectAll(): Promise<void> {
    console.log(`🧹 Disconnecting ${this.clientCache.size} cached Prisma clients...`);
    
    const disconnectPromises: Promise<void>[] = [];
    
    // Clear all timers
    for (const timer of this.cleanupIntervals.values()) {
      clearTimeout(timer);
    }
    this.cleanupIntervals.clear();

    // Disconnect all clients
    for (const [tenantId, client] of this.clientCache.entries()) {
      disconnectPromises.push(
        client.$disconnect().then(() => {
          console.log(`✅ Disconnected client for tenant: ${tenantId}`);
        })
      );
    }

    await Promise.all(disconnectPromises);
    this.clientCache.clear();
    console.log(`✅ All Prisma clients disconnected`);
  }

  /**
   * Reset the cleanup timer for a tenant client
   * Clients are automatically removed after 5 minutes of inactivity
   */
  private resetCleanupTimer(tenantId: string): void {
    // Clear existing timer
    const existingTimer = this.cleanupIntervals.get(tenantId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer (5 minutes)
    const timer = setTimeout(() => {
      this.removeClient(tenantId).catch(error => {
        console.error(`Failed to cleanup client for tenant ${tenantId}:`, error);
      });
    }, 5 * 60 * 1000); // 5 minutes

    this.cleanupIntervals.set(tenantId, timer);
  }
}

// Export a singleton instance
export const prismaService = new PrismaService();

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, disconnecting all Prisma clients...');
  await prismaService.disconnectAll();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, disconnecting all Prisma clients...');
  await prismaService.disconnectAll();
  process.exit(0);
});