// src/types/swagger-ui-express.d.ts
import type { RequestHandler } from 'express';

declare module 'swagger-ui-express' {
  const swaggerUi: {
    serve: RequestHandler[];
    setup: (swaggerDoc?: any, ...customOptions: any[]) => RequestHandler;
  };
  export default swaggerUi;
  export const serve: RequestHandler[];
  export function setup(swaggerDoc?: any, ...customOptions: any[]): RequestHandler;
}
