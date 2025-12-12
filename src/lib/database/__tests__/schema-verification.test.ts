import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Schema Verification Tests
 * 
 * These tests verify that the database schema matches the requirements:
 * - Requirements 2.1: All required columns exist with correct types
 * - Requirements 2.2: Primary key is set on id column
 * - Requirements 2.4: Indexes exist on category, uploadDate, and isPublic
 */

describe('Database Schema Verification', () => {
  let prisma: PrismaClient;
  let pool: Pool;

  beforeAll(() => {
    // Create a connection pool for Prisma 7
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:2430@localhost:5432/portfolio_videos?schema=public';
    pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    // Initialize PrismaClient with adapter (Prisma 7 approach)
    prisma = new PrismaClient({ adapter });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  describe('Schema Structure - Requirements 2.1', () => {
    it('should have all required columns with correct types', async () => {
      // Query the information schema to get column details
      const columns = await prisma.$queryRaw<Array<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
      }>>`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'videos'
        ORDER BY ordinal_position;
      `;

      // Convert to a map for easier assertions
      const columnMap = new Map(
        columns.map(col => [col.column_name, col])
      );

      // Verify all required columns exist
      const requiredColumns = [
        'id',
        'title',
        'description',
        'filename',
        'originalName',
        'mimeType',
        'size',
        'duration',
        'thumbnail',
        'uploadDate',
        'lastModified',
        'tags',
        'category',
        'isPublic',
        'viewCount'
      ];

      for (const colName of requiredColumns) {
        expect(columnMap.has(colName), `Column ${colName} should exist`).toBe(true);
      }

      // Verify specific column types
      expect(columnMap.get('id')?.data_type).toBe('text');
      expect(columnMap.get('title')?.data_type).toBe('text');
      expect(columnMap.get('description')?.data_type).toBe('text');
      expect(columnMap.get('filename')?.data_type).toBe('text');
      expect(columnMap.get('originalName')?.data_type).toBe('text');
      expect(columnMap.get('mimeType')?.data_type).toBe('text');
      expect(columnMap.get('size')?.data_type).toBe('bigint');
      expect(columnMap.get('duration')?.data_type).toBe('integer');
      expect(columnMap.get('thumbnail')?.data_type).toBe('text');
      expect(columnMap.get('uploadDate')?.data_type).toBe('timestamp without time zone');
      expect(columnMap.get('lastModified')?.data_type).toBe('timestamp without time zone');
      expect(columnMap.get('tags')?.data_type).toBe('ARRAY');
      expect(columnMap.get('category')?.data_type).toBe('USER-DEFINED'); // Enum type
      expect(columnMap.get('isPublic')?.data_type).toBe('boolean');
      expect(columnMap.get('viewCount')?.data_type).toBe('integer');
    });

    it('should have NOT NULL constraints on required fields', async () => {
      const columns = await prisma.$queryRaw<Array<{
        column_name: string;
        is_nullable: string;
      }>>`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'videos';
      `;

      const columnMap = new Map(
        columns.map(col => [col.column_name, col.is_nullable])
      );

      // Required fields should be NOT NULL
      expect(columnMap.get('id')).toBe('NO');
      expect(columnMap.get('title')).toBe('NO');
      expect(columnMap.get('filename')).toBe('NO');
      expect(columnMap.get('originalName')).toBe('NO');
      expect(columnMap.get('mimeType')).toBe('NO');
      expect(columnMap.get('size')).toBe('NO');
      expect(columnMap.get('uploadDate')).toBe('NO');
      expect(columnMap.get('lastModified')).toBe('NO');
      // Note: In PostgreSQL, array columns are nullable by default even with Prisma's non-nullable syntax
      // This is expected behavior - Prisma will handle empty arrays vs null at the application level
      expect(columnMap.get('category')).toBe('NO');
      expect(columnMap.get('isPublic')).toBe('NO');
      expect(columnMap.get('viewCount')).toBe('NO');

      // Optional fields should be nullable
      expect(columnMap.get('description')).toBe('YES');
      expect(columnMap.get('duration')).toBe('YES');
      expect(columnMap.get('thumbnail')).toBe('YES');
      expect(columnMap.get('tags')).toBe('YES'); // Arrays are nullable in PostgreSQL
    });

    it('should have correct default values', async () => {
      const columns = await prisma.$queryRaw<Array<{
        column_name: string;
        column_default: string | null;
      }>>`
        SELECT column_name, column_default
        FROM information_schema.columns
        WHERE table_name = 'videos';
      `;

      const columnMap = new Map(
        columns.map(col => [col.column_name, col.column_default])
      );

      // Note: Prisma's @default(cuid()) is handled at the application level,
      // not as a database default, so id won't have a database-level default
      
      // Check database-level default values
      const uploadDateDefault = columnMap.get('uploadDate');
      expect(uploadDateDefault).toBeTruthy();
      // PostgreSQL stores now() as CURRENT_TIMESTAMP
      expect(uploadDateDefault).toContain('CURRENT_TIMESTAMP');
      
      expect(columnMap.get('isPublic')).toBe('true'); // Default true
      expect(columnMap.get('viewCount')).toBe('0'); // Default 0
      
      // Note: Prisma's @updatedAt is handled at the application level,
      // not as a database default, so lastModified won't have a database-level default
    });
  });

  describe('Primary Key - Requirements 2.2', () => {
    it('should have primary key set on id column', async () => {
      const constraints = await prisma.$queryRaw<Array<{
        constraint_name: string;
        constraint_type: string;
        column_name: string;
      }>>`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'videos'
          AND tc.constraint_type = 'PRIMARY KEY';
      `;

      expect(constraints.length).toBeGreaterThan(0);
      expect(constraints[0].constraint_type).toBe('PRIMARY KEY');
      expect(constraints[0].column_name).toBe('id');
    });

    it('should have unique constraint on filename', async () => {
      // Check for unique index on filename (Prisma creates unique indexes for @unique)
      const indexes = await prisma.$queryRaw<Array<{
        indexname: string;
        indexdef: string;
      }>>`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'videos'
          AND indexdef LIKE '%filename%'
          AND indexdef LIKE '%UNIQUE%';
      `;

      expect(indexes.length).toBeGreaterThan(0);
      expect(indexes[0].indexdef).toContain('UNIQUE');
      expect(indexes[0].indexdef).toContain('filename');
    });
  });

  describe('Indexes - Requirements 2.4', () => {
    it('should have indexes on category, uploadDate, and isPublic', async () => {
      const indexes = await prisma.$queryRaw<Array<{
        indexname: string;
        indexdef: string;
      }>>`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'videos';
      `;

      const indexNames = indexes.map(idx => idx.indexname);
      const indexDefs = indexes.map(idx => idx.indexdef);

      // Check that indexes exist for the required columns
      const hasCategoryIndex = indexDefs.some(def => 
        def.includes('category') && !def.includes('PRIMARY KEY')
      );
      const hasUploadDateIndex = indexDefs.some(def => 
        def.includes('uploadDate') || def.includes('"uploadDate"')
      );
      const hasIsPublicIndex = indexDefs.some(def => 
        def.includes('isPublic') || def.includes('"isPublic"')
      );

      expect(hasCategoryIndex, 'Should have index on category column').toBe(true);
      expect(hasUploadDateIndex, 'Should have index on uploadDate column').toBe(true);
      expect(hasIsPublicIndex, 'Should have index on isPublic column').toBe(true);
    });

    it('should have at least 4 indexes (3 custom + 1 primary key)', async () => {
      const indexes = await prisma.$queryRaw<Array<{
        indexname: string;
      }>>`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'videos';
      `;

      // Should have: primary key index, category index, uploadDate index, isPublic index
      // Plus potentially the unique index on filename
      expect(indexes.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('VideoCategory Enum', () => {
    it('should have VideoCategory enum with correct values', async () => {
      const enumValues = await prisma.$queryRaw<Array<{
        enumlabel: string;
      }>>`
        SELECT enumlabel
        FROM pg_enum
        WHERE enumtypid = (
          SELECT oid
          FROM pg_type
          WHERE typname = 'VideoCategory'
        );
      `;

      const values = enumValues.map(e => e.enumlabel);

      expect(values).toContain('gameplay');
      expect(values).toContain('tutorial');
      expect(values).toContain('review');
      expect(values).toContain('stream');
      expect(values.length).toBe(4);
    });
  });
});
