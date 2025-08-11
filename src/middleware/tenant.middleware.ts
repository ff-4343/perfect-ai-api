import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { prismaService } from '../services/prisma.service.js';

// Extend Request interface to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      prisma?: PrismaClient;
    }
  }
}

/**
 * Middleware to extract tenant ID from X-Tenant-ID header
 * and attach the appropriate Prisma client to the request
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract tenant ID from header
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      res.status(400).json({
        error: 'Missing X-Tenant-ID header',
        message: 'All API requests must include a valid X-Tenant-ID header'
      });
      return;
    }

    // Validate tenant ID format (basic validation)
    if (typeof tenantId !== 'string' || tenantId.trim().length === 0) {
      res.status(400).json({
        error: 'Invalid X-Tenant-ID header',
        message: 'X-Tenant-ID must be a non-empty string'
      });
      return;
    }

    // Sanitize tenant ID (remove potential harmful characters)
    const sanitizedTenantId = tenantId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    
    if (sanitizedTenantId !== tenantId.trim().toLowerCase()) {
      res.status(400).json({
        error: 'Invalid X-Tenant-ID format',
        message: 'X-Tenant-ID can only contain letters, numbers, hyphens, and underscores'
      });
      return;
    }

    // Get Prisma client for this tenant
    let prismaClient: PrismaClient;
    try {
      prismaClient = await prismaService.getClient(sanitizedTenantId);
    } catch (error) {
      console.error(`Failed to get Prisma client for tenant ${sanitizedTenantId}:`, error);
      res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant '${sanitizedTenantId}' does not exist or is not accessible`
      });
      return;
    }

    // Attach tenant info to request
    req.tenantId = sanitizedTenantId;
    req.prisma = prismaClient;

    // Add tenant ID to response headers for debugging
    res.setHeader('X-Current-Tenant-ID', sanitizedTenantId);

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process tenant information'
    });
  }
};

/**
 * Optional middleware that makes tenant ID optional
 * Useful for endpoints that can work with or without tenant context
 */
export const optionalTenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (tenantId) {
      // If tenant ID is provided, process it like normal tenant middleware
      const sanitizedTenantId = tenantId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      
      if (sanitizedTenantId !== tenantId.trim().toLowerCase()) {
        res.status(400).json({
          error: 'Invalid X-Tenant-ID format',
          message: 'X-Tenant-ID can only contain letters, numbers, hyphens, and underscores'
        });
        return;
      }

      try {
        const prismaClient = await prismaService.getClient(sanitizedTenantId);
        req.tenantId = sanitizedTenantId;
        req.prisma = prismaClient;
        res.setHeader('X-Current-Tenant-ID', sanitizedTenantId);
      } catch (error) {
        console.error(`Failed to get Prisma client for tenant ${sanitizedTenantId}:`, error);
        res.status(404).json({
          error: 'Tenant not found',
          message: `Tenant '${sanitizedTenantId}' does not exist or is not accessible`
        });
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Optional tenant middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process tenant information'
    });
  }
};