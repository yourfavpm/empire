import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || '';

// Create PostgreSQL adapter
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Prisma v7 client with adapter
const prisma = new PrismaClient({ adapter });

export { prisma };
export default prisma;
