// Quick type definitions for libraries without official @types
declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'swagger-ui-express' {
  export const serve: any;
  export const setup: any;
}