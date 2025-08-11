// src/services/tenant.service.ts
import { PrismaClient } from '@prisma/client';

export interface CreateTenantInput {
  name: string;
  slug: string;
  domain?: string;
  plan?: 'basic' | 'pro' | 'enterprise';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: string;
  plan: string;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class TenantService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Validate tenant input
   */
  private validateTenantInput(input: CreateTenantInput): void {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Organization name is required');
    }
    if (!input.slug || input.slug.trim().length === 0) {
      throw new Error('Slug is required');
    }
    if (!/^[a-z0-9-]+$/.test(input.slug)) {
      throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
    }
  }

  /**
   * Create a new tenant (organization)
   */
  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    this.validateTenantInput(input);
    
    // Check if slug already exists
    const existing = await this.prisma.organization.findUnique({
      where: { slug: input.slug }
    });
    
    if (existing) {
      throw new Error(`Organization with slug '${input.slug}' already exists`);
    }
    
    // Check if domain already exists (if provided)
    if (input.domain) {
      const existingDomain = await this.prisma.organization.findUnique({
        where: { domain: input.domain }
      });
      
      if (existingDomain) {
        throw new Error(`Organization with domain '${input.domain}' already exists`);
      }
    }
    
    const plan = input.plan || 'basic';
    
    return this.prisma.organization.create({
      data: {
        name: input.name.trim(),
        slug: input.slug.trim(),
        domain: input.domain?.trim(),
        plan,
        status: 'active',
        settings: {
          features: {
            projects: true,
            ecommerce: plan !== 'basic',
            webhooks: plan === 'enterprise'
          },
          limits: {
            users: plan === 'basic' ? 5 : plan === 'pro' ? 50 : -1,
            projects: plan === 'basic' ? 3 : plan === 'pro' ? 25 : -1,
            products: plan === 'basic' ? 100 : plan === 'pro' ? 1000 : -1
          }
        }
      }
    });
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string): Promise<Tenant | null> {
    return this.prisma.organization.findUnique({
      where: { id }
    });
  }

  /**
   * Get tenant by slug
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    return this.prisma.organization.findUnique({
      where: { slug }
    });
  }

  /**
   * Get tenant by domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    return this.prisma.organization.findUnique({
      where: { domain }
    });
  }

  /**
   * List all tenants
   */
  async listTenants(page = 1, limit = 50): Promise<{ tenants: Tenant[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const [tenants, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.organization.count()
    ]);
    
    const pages = Math.ceil(total / limit);
    
    return { tenants, total, pages };
  }

  /**
   * Update tenant
   */
  async updateTenant(id: string, updates: Partial<Pick<Tenant, 'name' | 'domain' | 'status' | 'plan' | 'settings'>>): Promise<Tenant> {
    return this.prisma.organization.update({
      where: { id },
      data: updates
    });
  }

  /**
   * Delete tenant
   */
  async deleteTenant(id: string): Promise<void> {
    await this.prisma.organization.delete({
      where: { id }
    });
  }

  /**
   * Bootstrap tenant with initial data
   */
  async bootstrapTenant(tenantId: string, adminUser: { email: string; name?: string }): Promise<void> {
    // Create admin user
    await this.prisma.user.create({
      data: {
        orgId: tenantId,
        email: adminUser.email,
        name: adminUser.name || 'Admin',
        role: 'admin',
        status: 'active'
      }
    });

    // Create default categories (if ecommerce is enabled)
    const tenant = await this.getTenantById(tenantId);
    if (tenant?.settings?.features?.ecommerce) {
      const defaultCategories = [
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Clothing', slug: 'clothing' },
        { name: 'Books', slug: 'books' },
        { name: 'Home & Garden', slug: 'home-garden' }
      ];

      for (const cat of defaultCategories) {
        try {
          await this.prisma.category.create({
            data: {
              orgId: tenantId,
              name: cat.name,
              slug: cat.slug,
              status: 'active'
            }
          });
        } catch (error) {
          // Skip if category already exists
          console.warn(`Category ${cat.slug} already exists for tenant ${tenantId}`);
        }
      }
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantStats(tenantId: string): Promise<{
    users: number;
    projects: number;
    products: number;
    orders: number;
  }> {
    const [users, projects, products, orders] = await Promise.all([
      this.prisma.user.count({ where: { orgId: tenantId } }),
      this.prisma.project.count({ where: { orgId: tenantId } }),
      this.prisma.product.count({ where: { orgId: tenantId } }),
      this.prisma.order.count({ where: { orgId: tenantId } })
    ]);

    return { users, projects, products, orders };
  }
}