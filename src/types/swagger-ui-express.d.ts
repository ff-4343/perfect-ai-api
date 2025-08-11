// src/types/swagger-ui-express.d.ts
declare module 'swagger-ui-express' {
  import type { RequestHandler } from 'express';
  
  interface SwaggerUiOptions {
    swaggerOptions?: any;
    customCss?: string;
    customCssUrl?: string;
    customJs?: string;
    customJsUrl?: string;
    customfavIcon?: string;
    swaggerUrl?: string;
    customSiteTitle?: string;
    isExplorer?: boolean;
  }

  const swaggerUi: {
    serve: RequestHandler[];
    setup: (swaggerDoc?: any, options?: SwaggerUiOptions) => RequestHandler;
    generateHTML: (swaggerDoc: any, options?: SwaggerUiOptions) => string;
  };

  export = swaggerUi;
}