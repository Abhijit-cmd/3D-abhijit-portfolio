# Design Document: Video Database Migration to PostgreSQL

## Overview

This design outlines the migration of the gaming videos storage system from a local JSON file-based approach to a PostgreSQL relational database. The migration will use Prisma ORM for type-safe database access, maintain backward compatibility with existing frontend components, and provide a robust foundation for production deployment.

The current system stores video metadata in `src/data/videos.json` and video files in `public/uploads/videos`. The new system will store metadata in PostgreSQL while maintaining the same file storage approach (with future potential for cloud storage migration).

**Key Design Goals:**
- Zero downtime migration path
- Maintain existing API contracts
- Improve data integrity and concurrent access handling
- Enable efficient querying and filtering
- Support production-ready deployment

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Video Service (API Layer)                   │  │
│  │  - uploadVideo()                                      │  │
│  │  - getVideoById()                                     │  │
│  │  - updateVideo()                                      │  │
│  │  - deleteVideo()                                      │  │
│  │  - searchVideos()                                     │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │      PostgreSQL Repository (Data Access Layer)        │  │
│  │  - Prisma Client                                      │  │
│  │  - Connection Pool Management                         │  │
│  │  - Query Building                                     │  │
│  │  - Transaction Management                             │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
         ┌──────────▼──────────┐
         │  PostgreSQL Database │
         │  ┌────────────────┐ │
         │  │  videos table  │ │
         │  └────────────────┘ │
         └─────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              File Storage (Unchanged)                        │
│  public/uploads/videos/     - Video files                   │
│  public/uploads/thumbnails/ - Thumbnail images              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5.x
- **Connection Pooling**: Prisma's built-in connection pool
- **Migration Tool**: Prisma Migrate
- **Testing**: Vitest with PostgreSQL test database
- **Property Testing**: fast-check (already in dependencies)

### Why Prisma?

1. **Type Safety**: Auto-generated TypeScript types from schema
2. **Migration Management**: Built-in migration system
3. **Developer Experience**: Intuitive API and excellent documentation
4. **Next.js Integration**: First-class support for Next.js
5. **Connection Pooling**: Built-in connection pool management
6. **Query Performance**: Optimized query generation

## Components and Interfaces

### 1. Database Schema (Prisma Schema)

**File**: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Video {
  id           String   @id @default(cuid())
  title        String
  description  String?
  filename     String   @unique
  originalName String
  mimeType     String
  size         BigInt
  duration     Int?
  thumbnail    String?
  uploadDate   DateTime @default(now())
  lastModified DateTime @updatedAt
  tags         String[]
  category     VideoCategory
  isPublic     Boolean  @default(true)
  viewCount    Int      @default(0)

  @@index([category])
  @@index([uploadDate])
  @@index([isPublic])
  @@map("videos")
}

enum VideoCategory {
  gameplay
  tutorial
  review
  stream
}
```

**Schema Design Decisions:**
- `id`: Using `cuid()` for globally unique, URL-safe identifiers
- `filename`: Unique constraint to prevent duplicate file references
- `size`: BigInt to support large video files (>2GB)
- `tags`: Array type for flexible tagging without junction table
- `uploadDate`: Auto-set on creation
- `lastModified`: Auto-updated on any change
- Indexes on frequently queried fields for performance

### 2. Prisma Client Singleton

**File**: `src/lib/database/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

**Design Rationale:**
- Singleton pattern prevents multiple Prisma instances in development (Next.js hot reload)
- Conditional logging for development debugging
- Global reference for development environment

### 3. Video Repository Layer

**File**: `src/lib/repositories/video-repository.ts`

```typescript
import { Prisma, Video, VideoCategory } from '@prisma/client';
import prisma from '@/lib/database/prisma';
import { VideoMetadata, VideoSearchFilters, PaginatedVideoResponse } from '@/types/video';

export class VideoRepository {
  /**
   * Create a new video record
   */
  async create(data: Omit<VideoMetadata, 'uploadDate' | 'lastModified' | 'viewCount'>): Promise<VideoMetadata> {
    const video = await prisma.video.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: BigInt(data.size),
        duration: data.duration,
        thumbnail: data.thumbnail,
        tags: data.tags,
        category: data.category as VideoCategory,
        isPublic: data.isPublic,
      },
    });

    return this.mapToVideoMetadata(video);
  }

  /**
   * Find video by ID
   */
  async findById(id: string): Promise<VideoMetadata | null> {
    const video = await prisma.video.findUnique({
      where: { id },
    });

    return video ? this.mapToVideoMetadata(video) : null;
  }

  /**
   * Update video
   */
  async update(id: string, data: Partial<VideoMetadata>): Promise<VideoMetadata | null> {
    try {
      const video = await prisma.video.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          tags: data.tags,
          category: data.category as VideoCategory | undefined,
          isPublic: data.isPublic,
          duration: data.duration,
          thumbnail: data.thumbnail,
        },
      });

      return this.mapToVideoMetadata(video);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  /**
   * Delete video
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.video.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Record not found
      }
      throw error;
    }
  }

  /**
   * Find all videos with filters
   */
  async findAll(filters?: VideoSearchFilters): Promise<VideoMetadata[]> {
    const where = this.buildWhereClause(filters);

    const videos = await prisma.video.findMany({
      where,
      orderBy: { uploadDate: 'desc' },
    });

    return videos.map(this.mapToVideoMetadata);
  }

  /**
   * Find paginated videos
   */
  async findPaginated(
    page: number = 1,
    limit: number = 12,
    filters?: VideoSearchFilters
  ): Promise<PaginatedVideoResponse> {
    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [videos, totalCount] = await prisma.$transaction([
      prisma.video.findMany({
        where,
        orderBy: { uploadDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      videos: videos.map(this.mapToVideoMetadata),
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await prisma.video.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get video statistics
   */
  async getStats(): Promise<{
    totalVideos: number;
    totalViews: number;
    categoryCounts: Record<string, number>;
    publicVideos: number;
    privateVideos: number;
  }> {
    const [totalVideos, totalViews, categoryGroups, publicCount, privateCount] = await prisma.$transaction([
      prisma.video.count(),
      prisma.video.aggregate({
        _sum: {
          viewCount: true,
        },
      }),
      prisma.video.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
      }),
      prisma.video.count({ where: { isPublic: true } }),
      prisma.video.count({ where: { isPublic: false } }),
    ]);

    const categoryCounts: Record<string, number> = {};
    categoryGroups.forEach((group) => {
      categoryCounts[group.category] = group._count.category;
    });

    return {
      totalVideos,
      totalViews: Number(totalViews._sum.viewCount || 0),
      categoryCounts,
      publicVideos: publicCount,
      privateVideos: privateCount,
    };
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(filters?: VideoSearchFilters): Prisma.VideoWhereInput {
    if (!filters) return {};

    const where: Prisma.VideoWhereInput = {};

    if (filters.category) {
      where.category = filters.category as VideoCategory;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.searchTerm) {
      where.OR = [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [filters.searchTerm] } },
      ];
    }

    return where;
  }

  /**
   * Map Prisma Video to VideoMetadata
   */
  private mapToVideoMetadata(video: Video): VideoMetadata {
    return {
      id: video.id,
      title: video.title,
      description: video.description || undefined,
      filename: video.filename,
      originalName: video.originalName,
      mimeType: video.mimeType,
      size: Number(video.size),
      duration: video.duration || undefined,
      thumbnail: video.thumbnail || undefined,
      uploadDate: video.uploadDate,
      lastModified: video.lastModified,
      tags: video.tags,
      category: video.category as VideoMetadata['category'],
      isPublic: video.isPublic,
      viewCount: video.viewCount,
    };
  }
}
```

### 4. Updated Video Service

**File**: `src/lib/services/video-service.ts` (Modified)

The VideoService will be updated to use VideoRepository instead of VideoDatabaseService:

```typescript
import { VideoRepository } from '@/lib/repositories/video-repository';
import { FileStorageService } from '@/lib/storage/file-storage';
// ... rest of imports

export class VideoService {
  private fileStorage: FileStorageService;
  private repository: VideoRepository;

  constructor() {
    this.fileStorage = new FileStorageService();
    this.repository = new VideoRepository();
  }

  // All methods remain the same, but use this.repository instead of this.database
  // This maintains backward compatibility with existing API
}
```

## Data Models

### VideoMetadata Type (Unchanged)

The existing `VideoMetadata` interface in `src/types/video.ts` remains unchanged, ensuring backward compatibility:

```typescript
export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  uploadDate: Date;
  lastModified: Date;
  tags: string[];
  category: 'gameplay' | 'tutorial' | 'review' | 'stream';
  isPublic: boolean;
  viewCount: number;
}
```

### Database Model Mapping

| VideoMetadata Field | PostgreSQL Column | Type | Notes |
|---------------------|-------------------|------|-------|
| id | id | TEXT (CUID) | Primary key |
| title | title | TEXT | NOT NULL |
| description | description | TEXT | Nullable |
| filename | filename | TEXT | UNIQUE, NOT NULL |
| originalName | original_name | TEXT | NOT NULL |
| mimeType | mime_type | TEXT | NOT NULL |
| size | size | BIGINT | For files >2GB |
| duration | duration | INTEGER | Nullable, in seconds |
| thumbnail | thumbnail | TEXT | Nullable, file path |
| uploadDate | upload_date | TIMESTAMP | Default NOW() |
| lastModified | last_modified | TIMESTAMP | Auto-updated |
| tags | tags | TEXT[] | Array type |
| category | category | ENUM | gameplay/tutorial/review/stream |
| isPublic | is_public | BOOLEAN | Default TRUE |
| viewCount | view_count | INTEGER | Default 0 |

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: NOT NULL constraint enforcement
*For any* required field (title, filename, category), attempting to insert a video record with a null value in that field should be rejected by the database
**Validates: Requirements 2.3**

### Property 2: Migration data transformation correctness
*For any* valid JSON video record, the migration process should produce a database record with equivalent data in all fields
**Validates: Requirements 3.2**

### Property 3: Date conversion correctness
*For any* date string in the JSON format, the migration should convert it to a PostgreSQL timestamp that represents the same point in time
**Validates: Requirements 3.3**

### Property 4: Video creation persistence
*For any* valid video metadata, creating a video record should result in that video being retrievable by its ID with all fields matching
**Validates: Requirements 4.1**

### Property 5: Filter correctness
*For any* set of filters (category, tags, isPublic, searchTerm), the query results should include only videos that match all specified filter criteria
**Validates: Requirements 4.2**

### Property 6: Update atomicity
*For any* video update operation, either all specified fields are updated or none are updated (no partial updates on failure)
**Validates: Requirements 4.3**

### Property 7: Deletion completeness
*For any* video that exists in the database, deleting it should result in that video no longer being retrievable by any query
**Validates: Requirements 4.4**

### Property 8: Concurrent operation safety
*For any* two concurrent operations on the same video, the final state should be consistent and not corrupted
**Validates: Requirements 4.5**

### Property 9: Text search completeness
*For any* search term, the results should include all videos where the title or description contains that term (case-insensitive)
**Validates: Requirements 5.1**

### Property 10: Category filter exactness
*For any* category value, filtering by that category should return only videos with exactly that category
**Validates: Requirements 5.2**

### Property 11: Tag filter inclusiveness
*For any* set of filter tags, the results should include all videos that have at least one of the specified tags
**Validates: Requirements 5.3**

### Property 12: Pagination correctness
*For any* page number and limit, the paginated results should return the correct subset of videos without duplicates or omissions
**Validates: Requirements 5.4**

### Property 13: Sort order correctness
*For any* sort field (uploadDate, viewCount), the results should be ordered correctly by that field
**Validates: Requirements 5.5**

### Property 14: Return type consistency
*For any* video operation, the returned data should conform to the VideoMetadata interface structure
**Validates: Requirements 6.2**

### Property 15: Date type conversion
*For any* video record retrieved from the database, the uploadDate and lastModified fields should be JavaScript Date objects
**Validates: Requirements 6.4**

### Property 16: Constraint violation error clarity
*For any* database constraint violation (e.g., duplicate filename, null required field), the system should return an error message that clearly indicates which constraint was violated
**Validates: Requirements 8.3**

### Property 17: Transaction rollback completeness
*For any* transaction that fails, all changes within that transaction should be rolled back, leaving the database in its pre-transaction state
**Validates: Requirements 8.4**

## Error Handling

### Error Categories

1. **Connection Errors**
   - Database unreachable
   - Authentication failures
   - Network timeouts
   - **Handling**: Retry with exponential backoff (3 attempts), then throw descriptive error

2. **Constraint Violations**
   - Duplicate filename
   - NULL in required field
   - Invalid enum value
   - **Handling**: Catch Prisma errors, map to user-friendly messages

3. **Not Found Errors**
   - Video ID doesn't exist
   - **Handling**: Return null for get operations, false for delete operations

4. **Transaction Failures**
   - Concurrent modification conflicts
   - Deadlocks
   - **Handling**: Automatic rollback, retry logic for transient failures

5. **Query Errors**
   - Invalid filter parameters
   - Malformed queries
   - **Handling**: Validate inputs before querying, return descriptive errors

### Error Mapping Strategy

```typescript
// src/lib/repositories/error-handler.ts
import { Prisma } from '@prisma/client';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new DatabaseError(
          'A video with this filename already exists',
          'DUPLICATE_FILENAME',
          error
        );
      case 'P2025':
        throw new DatabaseError(
          'Video not found',
          'NOT_FOUND',
          error
        );
      case 'P2003':
        throw new DatabaseError(
          'Foreign key constraint violation',
          'CONSTRAINT_VIOLATION',
          error
        );
      default:
        throw new DatabaseError(
          'Database operation failed',
          'UNKNOWN_ERROR',
          error
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseError(
      'Invalid data provided',
      'VALIDATION_ERROR',
      error
    );
  }

  throw error;
}
```

### Retry Logic

```typescript
// src/lib/database/retry.ts
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors or constraint violations
      if (
        error instanceof Prisma.PrismaClientValidationError ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          ['P2002', 'P2003', 'P2025'].includes(error.code))
      ) {
        throw error;
      }

      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Schema Validation Tests**
   - Verify all required columns exist in the database schema
   - Verify indexes are created on the correct columns
   - Verify primary key is set correctly

2. **CRUD Operation Tests**
   - Create video with valid data
   - Retrieve video by ID
   - Update video metadata
   - Delete video
   - Handle not found cases

3. **Error Handling Tests**
   - Duplicate filename rejection
   - NULL constraint violations
   - Invalid enum values
   - Connection failure handling

4. **Migration Tests**
   - Migrate sample JSON data
   - Verify record count matches
   - Verify data integrity after migration
   - Handle empty JSON file
   - Handle malformed JSON

5. **API Compatibility Tests**
   - Verify VideoService method signatures unchanged
   - Verify return types match VideoMetadata interface
   - Verify error types match previous implementation

### Property-Based Tests

Property-based tests will verify universal properties across many randomly generated inputs using fast-check:

1. **Property 1: NOT NULL constraint enforcement** (Requirements 2.3)
   - Generate random video data with null values in required fields
   - Verify database rejects the insertion

2. **Property 2: Migration data transformation correctness** (Requirements 3.2)
   - Generate random valid JSON video records
   - Migrate them to database
   - Verify all fields match

3. **Property 3: Date conversion correctness** (Requirements 3.3)
   - Generate random date strings
   - Verify conversion to timestamps preserves the same point in time

4. **Property 4: Video creation persistence** (Requirements 4.1)
   - Generate random valid video metadata
   - Create video, then retrieve it
   - Verify all fields match

5. **Property 5: Filter correctness** (Requirements 4.2)
   - Generate random video collections and filter criteria
   - Verify results match filter criteria

6. **Property 6: Update atomicity** (Requirements 4.3)
   - Generate random update operations
   - Verify either all fields updated or none

7. **Property 7: Deletion completeness** (Requirements 4.4)
   - Generate random videos, delete them
   - Verify they're no longer retrievable

8. **Property 8: Concurrent operation safety** (Requirements 4.5)
   - Generate random concurrent operations
   - Verify final state is consistent

9. **Property 9: Text search completeness** (Requirements 5.1)
   - Generate random videos and search terms
   - Verify all matching videos are returned

10. **Property 10: Category filter exactness** (Requirements 5.2)
    - Generate random video collections
    - Filter by category, verify only that category returned

11. **Property 11: Tag filter inclusiveness** (Requirements 5.3)
    - Generate random videos with tags
    - Filter by tags, verify correct videos returned

12. **Property 12: Pagination correctness** (Requirements 5.4)
    - Generate random video collections
    - Verify pagination returns correct subsets

13. **Property 13: Sort order correctness** (Requirements 5.5)
    - Generate random video collections
    - Verify sorting is correct

14. **Property 14: Return type consistency** (Requirements 6.2)
    - Generate random operations
    - Verify return types match VideoMetadata

15. **Property 15: Date type conversion** (Requirements 6.4)
    - Generate random videos
    - Verify date fields are Date objects

16. **Property 16: Constraint violation error clarity** (Requirements 8.3)
    - Generate constraint violations
    - Verify error messages are clear

17. **Property 17: Transaction rollback completeness** (Requirements 8.4)
    - Generate random failing transactions
    - Verify complete rollback

### Test Database Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test-setup-db.ts'],
    testTimeout: 30000,
  },
});
```

```typescript
// src/test-setup-db.ts
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || 'postgresql://test:test@localhost:5432/video_test',
    },
  },
});

beforeAll(async () => {
  // Run migrations on test database
  execSync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL_TEST,
    },
  });
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.video.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
```

### Integration Test Example

```typescript
// src/lib/repositories/__tests__/video-repository.integration.test.ts
import { describe, it, expect } from 'vitest';
import { VideoRepository } from '../video-repository';
import { prisma } from '@/test-setup-db';

describe('VideoRepository Integration Tests', () => {
  const repository = new VideoRepository();

  it('should create and retrieve a video', async () => {
    const videoData = {
      id: 'test-video-1',
      title: 'Test Video',
      description: 'A test video',
      filename: 'test.mp4',
      originalName: 'test.mp4',
      mimeType: 'video/mp4',
      size: 1024000,
      tags: ['test', 'demo'],
      category: 'gameplay' as const,
      isPublic: true,
    };

    const created = await repository.create(videoData);
    expect(created.id).toBe(videoData.id);
    expect(created.title).toBe(videoData.title);

    const retrieved = await repository.findById(videoData.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe(videoData.title);
  });

  it('should reject duplicate filenames', async () => {
    const videoData = {
      id: 'test-video-2',
      title: 'Test Video',
      filename: 'duplicate.mp4',
      originalName: 'duplicate.mp4',
      mimeType: 'video/mp4',
      size: 1024000,
      tags: [],
      category: 'gameplay' as const,
      isPublic: true,
    };

    await repository.create(videoData);

    await expect(
      repository.create({ ...videoData, id: 'test-video-3' })
    ).rejects.toThrow();
  });
});
```

### Property-Based Test Example

```typescript
// src/lib/repositories/__tests__/video-repository.property.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { VideoRepository } from '../video-repository';

describe('VideoRepository Property Tests', () => {
  const repository = new VideoRepository();

  it('Property 4: Video creation persistence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.option(fc.string({ maxLength: 1000 })),
          filename: fc.string({ minLength: 1, maxLength: 255 }).map(s => `${s}.mp4`),
          originalName: fc.string({ minLength: 1, maxLength: 255 }),
          mimeType: fc.constantFrom('video/mp4', 'video/webm', 'video/quicktime'),
          size: fc.integer({ min: 1, max: 500000000 }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
          category: fc.constantFrom('gameplay', 'tutorial', 'review', 'stream'),
          isPublic: fc.boolean(),
        }),
        async (videoData) => {
          // Create video
          const created = await repository.create(videoData);

          // Retrieve video
          const retrieved = await repository.findById(created.id);

          // Verify all fields match
          expect(retrieved).not.toBeNull();
          expect(retrieved?.id).toBe(videoData.id);
          expect(retrieved?.title).toBe(videoData.title);
          expect(retrieved?.filename).toBe(videoData.filename);
          expect(retrieved?.category).toBe(videoData.category);
          expect(retrieved?.isPublic).toBe(videoData.isPublic);

          // Cleanup
          await repository.delete(created.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10: Category filter exactness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            filename: fc.uuid().map(id => `${id}.mp4`),
            originalName: fc.string({ minLength: 1, maxLength: 255 }),
            mimeType: fc.constant('video/mp4'),
            size: fc.integer({ min: 1, max: 500000000 }),
            tags: fc.array(fc.string({ minLength: 1, maxLength: 50 })),
            category: fc.constantFrom('gameplay', 'tutorial', 'review', 'stream'),
            isPublic: fc.boolean(),
          }),
          { minLength: 5, maxLength: 20 }
        ),
        fc.constantFrom('gameplay', 'tutorial', 'review', 'stream'),
        async (videos, filterCategory) => {
          // Create all videos
          for (const video of videos) {
            await repository.create(video);
          }

          // Filter by category
          const results = await repository.findAll({ category: filterCategory });

          // Verify all results have the correct category
          for (const result of results) {
            expect(result.category).toBe(filterCategory);
          }

          // Cleanup
          for (const video of videos) {
            await repository.delete(video.id);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
```

## Migration Strategy

### Phase 1: Setup (No Code Changes)

1. Install dependencies:
   ```bash
   npm install prisma @prisma/client
   npm install -D @types/pg
   ```

2. Initialize Prisma:
   ```bash
   npx prisma init
   ```

3. Configure `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_videos?schema=public"
   DATABASE_URL_TEST="postgresql://user:password@localhost:5432/portfolio_videos_test?schema=public"
   ```

4. Create Prisma schema (as shown in Components section)

5. Run initial migration:
   ```bash
   npx prisma migrate dev --name init
   ```

### Phase 2: Implement Repository Layer

1. Create `src/lib/database/prisma.ts` (Prisma client singleton)
2. Create `src/lib/repositories/video-repository.ts`
3. Create `src/lib/repositories/error-handler.ts`
4. Create `src/lib/database/retry.ts`
5. Write unit tests for repository layer

### Phase 3: Data Migration Script

Create `scripts/migrate-json-to-postgres.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function migrateData() {
  try {
    // Read JSON file
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'videos.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const videos = JSON.parse(jsonData);

    console.log(`Found ${videos.length} videos to migrate`);

    // Migrate each video
    for (const video of videos) {
      await prisma.video.create({
        data: {
          id: video.id,
          title: video.title,
          description: video.description,
          filename: video.filename,
          originalName: video.originalName,
          mimeType: video.mimeType,
          size: BigInt(video.size),
          duration: video.duration,
          thumbnail: video.thumbnail,
          uploadDate: new Date(video.uploadDate),
          lastModified: new Date(video.lastModified),
          tags: video.tags,
          category: video.category,
          isPublic: video.isPublic,
          viewCount: video.viewCount,
        },
      });
      console.log(`Migrated: ${video.title}`);
    }

    // Verify count
    const count = await prisma.video.count();
    console.log(`Migration complete. Total videos in database: ${count}`);

    // Backup JSON file
    const backupPath = jsonPath + '.backup';
    await fs.copyFile(jsonPath, backupPath);
    console.log(`Backup created at: ${backupPath}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
```

Run migration:
```bash
npx tsx scripts/migrate-json-to-postgres.ts
```

### Phase 4: Update Service Layer

1. Update `src/lib/services/video-service.ts` to use VideoRepository
2. Remove dependency on VideoDatabaseService
3. Run existing tests to verify backward compatibility

### Phase 5: Testing & Validation

1. Run all unit tests
2. Run property-based tests
3. Manual testing of video upload, retrieval, update, delete
4. Performance testing with larger datasets

### Phase 6: Cleanup

1. Archive `src/lib/storage/video-database.ts`
2. Keep `src/data/videos.json.backup` for rollback capability
3. Update documentation

### Rollback Plan

If issues are discovered:

1. Revert code changes to use VideoDatabaseService
2. Restore `src/data/videos.json` from backup
3. Investigate and fix issues
4. Re-attempt migration

## Deployment Considerations

### Environment Variables

```env
# Development
DATABASE_URL="postgresql://dev_user:dev_pass@localhost:5432/portfolio_videos_dev"

# Production
DATABASE_URL="postgresql://prod_user:prod_pass@prod-host:5432/portfolio_videos?sslmode=require&connection_limit=10"

# Test
DATABASE_URL_TEST="postgresql://test_user:test_pass@localhost:5432/portfolio_videos_test"
```

### Production Checklist

- [ ] PostgreSQL database provisioned
- [ ] Database user created with appropriate permissions
- [ ] SSL certificates configured
- [ ] Connection pooling configured (recommended: 10-20 connections)
- [ ] Database backups scheduled
- [ ] Monitoring and alerting configured
- [ ] Migration script tested on staging
- [ ] Rollback plan documented
- [ ] Environment variables configured
- [ ] Health check endpoint implemented

### Performance Optimization

1. **Indexes**: Already defined in schema for frequently queried columns
2. **Connection Pooling**: Prisma handles automatically, configure via DATABASE_URL
3. **Query Optimization**: Use Prisma's query optimization features
4. **Caching**: Consider Redis for frequently accessed data if needed
5. **Pagination**: Always use pagination for list queries

### Security Considerations

1. **SQL Injection**: Prisma uses parameterized queries automatically
2. **Credentials**: Never commit DATABASE_URL to version control
3. **SSL**: Use SSL connections in production
4. **Permissions**: Database user should have minimal required permissions
5. **Backups**: Regular automated backups with encryption

## Future Enhancements

1. **Full-Text Search**: Implement PostgreSQL full-text search with tsvector
2. **Video Analytics**: Track detailed view analytics (watch time, completion rate)
3. **Related Videos**: Implement recommendation system based on tags/category
4. **Comments**: Add comments table with foreign key to videos
5. **Playlists**: Add playlist functionality with many-to-many relationship
6. **Cloud Storage**: Migrate file storage to S3/CloudFlare R2
7. **CDN Integration**: Serve videos through CDN for better performance
8. **Transcoding**: Add video transcoding pipeline for multiple quality levels
