// Mock Prisma client for testing when prisma generate fails
// This allows the application to start and basic functionality to be tested

export class MockPrismaClient {
  organization = {
    create: async (args: any) => {
      const org = {
        id: 'org_' + Math.random().toString(36).substr(2, 9),
        name: args.data.name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('Mock: Created organization:', org);
      return org;
    },
    
    findMany: async (args?: any) => {
      const orgs = [
        {
          id: 'org_mock1',
          name: 'Mock Organization 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'org_mock2',
          name: 'Mock Organization 2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      console.log('Mock: Listed organizations:', orgs);
      return orgs;
    },
    
    findUnique: async (args: any) => {
      const org = {
        id: args.where.id,
        name: 'Mock Organization',
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: []
      };
      console.log('Mock: Found organization:', org);
      return org;
    }
  };
  
  project = {
    create: async (args: any) => {
      const project = {
        id: 'proj_' + Math.random().toString(36).substr(2, 9),
        orgId: args.data.orgId,
        name: args.data.name,
        archetype: args.data.archetype || '',
        status: args.data.status || 'planning',
        spec: args.data.spec || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('Mock: Created project:', project);
      return project;
    },
    
    findMany: async (args?: any) => {
      const projects = [
        {
          id: 'proj_mock1',
          orgId: args?.where?.orgId || 'org_mock1',
          name: 'Mock Project 1',
          archetype: 'saas',
          status: 'planning',
          spec: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      console.log('Mock: Listed projects:', projects);
      return projects;
    },
    
    count: async () => 1,
    
    findUnique: async (args: any) => {
      const project = {
        id: args.where.id,
        orgId: 'org_mock1',
        name: 'Mock Project',
        archetype: 'saas',
        status: 'planning',
        spec: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('Mock: Found project:', project);
      return project;
    },
    
    update: async (args: any) => {
      const project = {
        id: args.where.id,
        orgId: 'org_mock1',
        name: args.data.name || 'Updated Mock Project',
        archetype: args.data.archetype || 'saas',
        status: args.data.status || 'planning',
        spec: args.data.spec || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('Mock: Updated project:', project);
      return project;
    },
    
    delete: async (args: any) => {
      console.log('Mock: Deleted project:', args.where.id);
      return {};
    }
  };
  
  $connect = async () => {
    console.log('Mock: Connected to database');
  };
  
  $disconnect = async () => {
    console.log('Mock: Disconnected from database');
  };
}

const prisma = new MockPrismaClient();
export default prisma;