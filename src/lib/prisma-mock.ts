// Mock Prisma client for testing purposes when generate fails
export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  projects?: Project[];
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  archetype: string;
  status: string;
  spec: any;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization;
}

class MockPrismaClient {
  organization = {
    create: async (data: any): Promise<Organization> => {
      console.log('Mock: Creating organization', data);
      return {
        id: 'org_' + Date.now(),
        name: data.data.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    findMany: async (options?: any): Promise<Organization[]> => {
      console.log('Mock: Finding organizations', options);
      return [];
    },
    findUnique: async (options: any): Promise<Organization | null> => {
      console.log('Mock: Finding unique organization', options);
      return null;
    },
  };

  project = {
    create: async (data: any): Promise<Project> => {
      console.log('Mock: Creating project', data);
      return {
        id: 'prj_' + Date.now(),
        orgId: data.data.orgId,
        name: data.data.name,
        archetype: data.data.archetype || '',
        status: data.data.status || 'planning',
        spec: data.data.spec || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    findMany: async (options?: any): Promise<Project[]> => {
      console.log('Mock: Finding projects', options);
      return [];
    },
    findUnique: async (options: any): Promise<Project | null> => {
      console.log('Mock: Finding unique project', options);
      return null;
    },
    update: async (options: any): Promise<Project> => {
      console.log('Mock: Updating project', options);
      return {
        id: options.where.id,
        orgId: 'org_123',
        name: 'Updated Project',
        archetype: '',
        status: 'planning',
        spec: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    delete: async (options: any): Promise<Project> => {
      console.log('Mock: Deleting project', options);
      return {
        id: options.where.id,
        orgId: 'org_123',
        name: 'Deleted Project',
        archetype: '',
        status: 'planning',
        spec: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    count: async (options?: any): Promise<number> => {
      console.log('Mock: Counting projects', options);
      return 0;
    },
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