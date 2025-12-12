import { PrismaClient } from '@prisma/client';

// Only import pg modules on the server side
let prismaInstance: PrismaClient | undefined;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    // Dynamic import for server-side only modules
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  
  // This should never be called on the client, but return a dummy client just in case
  throw new Error('Prisma Client cannot be used on the client side');
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
