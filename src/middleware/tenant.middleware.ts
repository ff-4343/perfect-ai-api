// src/middleware/tenant.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { TenantPrismaFactory, TenantPrismaService, TenantContext } from '../services/prisma.service.js';

// Extend the Request interface to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
        name: string;
        domain?: string;
        status: string;
        plan: string;
        settings?: any;
      };
      tenantPrisma?: TenantPrismaService;
    }
  }
}

export interface TenantMiddlewareConfig {
  headerName?: string;
  subdomainExtraction?: boolean;
  domainExtraction?: boolean;
  slugParam?: string;
  required?: boolean;
}

/**
 * Middleware to extract and validate tenant context
 */
export function createTenantMiddleware(
  prisma: PrismaClient,
  config: TenantMiddlewareConfig = {}
) {
  const {
    headerName = 'x-tenant-slug',
    subdomainExtraction = true,
    domainExtraction = true,
    slugParam = 'tenantSlug',
    required = true
  } = config;

  const tenantFactory = new TenantPrismaFactory(prisma);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let tenantIdentifier: string | null = null;
      let identifierType: 'slug' | 'domain' = 'slug';

      // 1. Try to get tenant from header
      if (req.headers[headerName]) {
        tenantIdentifier = req.headers[headerName] as string;
        identifierType = 'slug';
      }

      // 2. Try to get tenant from route parameter
      if (!tenantIdentifier && req.params[slugParam]) {
        tenantIdentifier = req.params[slugParam];
        identifierType = 'slug';
      }

      // 3. Try to get tenant from subdomain
      if (!tenantIdentifier && subdomainExtraction) {
        const host = req.get('host') || '';
        const subdomain = extractSubdomain(host);
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          tenantIdentifier = subdomain;
          identifierType = 'slug';
        }
      }

      // 4. Try to get tenant from full domain
      if (!tenantIdentifier && domainExtraction) {
        const host = req.get('host') || '';
        if (host && !isLocalhost(host) && !isIP(host)) {
          tenantIdentifier = host;
          identifierType = 'domain';
        }
      }

      // 5. If no tenant found and required, return error
      if (!tenantIdentifier) {
        if (required) {
          return res.status(400).json({
            error: 'Tenant not specified',
            message: 'Please specify a tenant via header, subdomain, domain, or route parameter'
          });
        } else {
          return next();
        }
      }

      // Find the tenant in database
      const tenant = identifierType === 'domain' 
        ? await prisma.organization.findUnique({ where: { domain: tenantIdentifier } })
        : await prisma.organization.findUnique({ where: { slug: tenantIdentifier } });

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          message: `Organization with ${identifierType} '${tenantIdentifier}' not found`
        });
      }

      // Check if tenant is active
      if (tenant.status !== 'active') {
        return res.status(403).json({
          error: 'Tenant not active',
          message: `Organization '${tenant.name}' is not active`
        });
      }

      // Create tenant context
      const tenantContext: TenantContext = {
        tenantId: tenant.id,
        tenantSlug: tenant.slug
      };

      // Attach tenant to request
      req.tenant = tenant;
      req.tenantPrisma = tenantFactory.createTenantService(tenantContext);

      // Add tenant info to response headers for debugging
      res.setHeader('x-tenant-id', tenant.id);
      res.setHeader('x-tenant-slug', tenant.slug);

      next();
    } catch (error) {
      console.error('Tenant middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to resolve tenant context'
      });
    }
  };
}

/**
 * Optional tenant middleware - doesn't fail if tenant is not found
 */
export function createOptionalTenantMiddleware(
  prisma: PrismaClient,
  config: Omit<TenantMiddlewareConfig, 'required'> = {}
) {
  return createTenantMiddleware(prisma, { ...config, required: false });
}

/**
 * Extract subdomain from host
 */
function extractSubdomain(host: string): string | null {
  const parts = host.split('.');
  if (parts.length < 3) return null;
  
  // Remove port if present
  const firstPart = parts[0].split(':')[0];
  
  return firstPart;
}

/**
 * Check if host is localhost
 */
function isLocalhost(host: string): boolean {
  const cleanHost = host.split(':')[0];
  return cleanHost === 'localhost' || cleanHost === '127.0.0.1' || cleanHost === '0.0.0.0';
}

/**
 * Check if host is an IP address
 */
function isIP(host: string): boolean {
  const cleanHost = host.split(':')[0];
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  return ipRegex.test(cleanHost);
}

/**
 * Utility function to get tenant from request
 */
export function getTenantFromRequest(req: Request) {
  return req.tenant;
}

/**
 * Utility function to get tenant-scoped Prisma from request
 */
export function getTenantPrismaFromRequest(req: Request) {
  if (!req.tenantPrisma) {
    throw new Error('Tenant context not available. Make sure tenant middleware is applied.');
  }
  return req.tenantPrisma;
}

/**
 * Higher-order function to wrap route handlers with tenant validation
 */
export function withTenant<T extends Request = Request>(
  handler: (req: T, res: Response, next: NextFunction) => void | Promise<void>
) {
  return (req: T, res: Response, next: NextFunction) => {
    if (!req.tenant || !req.tenantPrisma) {
      return res.status(400).json({
        error: 'Tenant context required',
        message: 'This endpoint requires tenant context'
      });
    }
    return handler(req, res, next);
  };
}