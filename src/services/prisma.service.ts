// src/services/prisma.service.ts
import { PrismaClient } from '@prisma/client';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
}

/**
 * Tenant-scoped Prisma service that automatically filters queries by tenant
 */
export class TenantPrismaService {
  constructor(private prisma: PrismaClient, private context: TenantContext) {}

  /**
   * Get the tenant context
   */
  getTenantContext(): TenantContext {
    return this.context;
  }

  /**
   * Get tenant-scoped user operations
   */
  get users() {
    const tenantId = this.context.tenantId;
    return {
      findMany: (args?: any) => this.prisma.user.findMany({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      findUnique: (args: any) => this.prisma.user.findUnique({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      findFirst: (args?: any) => this.prisma.user.findFirst({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      create: (args: any) => this.prisma.user.create({
        ...args,
        data: { ...args.data, orgId: tenantId }
      }),
      update: (args: any) => this.prisma.user.update({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      delete: (args: any) => this.prisma.user.delete({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      count: (args?: any) => this.prisma.user.count({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      })
    };
  }

  /**
   * Get tenant-scoped project operations
   */
  get projects() {
    const tenantId = this.context.tenantId;
    return {
      findMany: (args?: any) => this.prisma.project.findMany({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      findUnique: (args: any) => this.prisma.project.findUnique({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      findFirst: (args?: any) => this.prisma.project.findFirst({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      create: (args: any) => this.prisma.project.create({
        ...args,
        data: { ...args.data, orgId: tenantId }
      }),
      update: (args: any) => this.prisma.project.update({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      delete: (args: any) => this.prisma.project.delete({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      count: (args?: any) => this.prisma.project.count({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      })
    };
  }

  /**
   * Get tenant-scoped product operations
   */
  get products() {
    const tenantId = this.context.tenantId;
    return {
      findMany: (args?: any) => this.prisma.product.findMany({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      findUnique: (args: any) => this.prisma.product.findUnique({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      findFirst: (args?: any) => this.prisma.product.findFirst({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      create: (args: any) => this.prisma.product.create({
        ...args,
        data: { ...args.data, orgId: tenantId }
      }),
      update: (args: any) => this.prisma.product.update({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      delete: (args: any) => this.prisma.product.delete({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      count: (args?: any) => this.prisma.product.count({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      })
    };
  }

  /**
   * Get tenant-scoped category operations
   */
  get categories() {
    const tenantId = this.context.tenantId;
    return {
      findMany: (args?: any) => this.prisma.category.findMany({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      findUnique: (args: any) => this.prisma.category.findUnique({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      findFirst: (args?: any) => this.prisma.category.findFirst({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      create: (args: any) => this.prisma.category.create({
        ...args,
        data: { ...args.data, orgId: tenantId }
      }),
      update: (args: any) => this.prisma.category.update({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      delete: (args: any) => this.prisma.category.delete({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      count: (args?: any) => this.prisma.category.count({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      })
    };
  }

  /**
   * Get tenant-scoped cart operations
   */
  get carts() {
    const tenantId = this.context.tenantId;
    return {
      findMany: (args?: any) => this.prisma.cart.findMany({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      findUnique: (args: any) => this.prisma.cart.findUnique({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      findFirst: (args?: any) => this.prisma.cart.findFirst({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      create: (args: any) => this.prisma.cart.create({
        ...args,
        data: { ...args.data, orgId: tenantId }
      }),
      update: (args: any) => this.prisma.cart.update({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      delete: (args: any) => this.prisma.cart.delete({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      count: (args?: any) => this.prisma.cart.count({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      })
    };
  }

  /**
   * Get tenant-scoped order operations
   */
  get orders() {
    const tenantId = this.context.tenantId;
    return {
      findMany: (args?: any) => this.prisma.order.findMany({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      findUnique: (args: any) => this.prisma.order.findUnique({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      findFirst: (args?: any) => this.prisma.order.findFirst({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      }),
      create: (args: any) => this.prisma.order.create({
        ...args,
        data: { ...args.data, orgId: tenantId }
      }),
      update: (args: any) => this.prisma.order.update({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      delete: (args: any) => this.prisma.order.delete({
        ...args,
        where: { ...args.where, orgId: tenantId }
      }),
      count: (args?: any) => this.prisma.order.count({
        ...args,
        where: { ...args?.where, orgId: tenantId }
      })
    };
  }

  /**
   * Execute raw queries with tenant context
   * NOTE: Be careful with raw queries to maintain tenant isolation
   */
  $queryRaw(query: TemplateStringsArray, ...values: any[]) {
    return this.prisma.$queryRaw(query, ...values);
  }

  /**
   * Execute raw queries with tenant context
   */
  $executeRaw(query: TemplateStringsArray, ...values: any[]) {
    return this.prisma.$executeRaw(query, ...values);
  }

  /**
   * Begin a transaction with tenant context
   */
  $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}

/**
 * Factory to create tenant-scoped Prisma services
 */
export class TenantPrismaFactory {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a tenant-scoped Prisma service
   */
  createTenantService(context: TenantContext): TenantPrismaService {
    return new TenantPrismaService(this.prisma, context);
  }

  /**
   * Get the underlying Prisma client (use with caution)
   */
  getRawPrisma(): PrismaClient {
    return this.prisma;
  }
}