# Implementation Plan

- [x] 1. Set up PostgreSQL and Prisma infrastructure





  - Install Prisma dependencies (`prisma`, `@prisma/client`, `@types/pg`)
  - Initialize Prisma with `npx prisma init`
  - Create `.env` file with `DATABASE_URL` and `DATABASE_URL_TEST` variables
  - Create Prisma schema file with Video model and VideoCategory enum
  - Run initial migration to create database schema
  - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.4_

- [x] 1.1 Write unit test to verify schema structure






  - **Example test**: Verify all required columns exist with correct types
  - **Example test**: Verify indexes exist on category, uploadDate, and isPublic
  - **Example test**: Verify primary key is set on id column
  - _Requirements: 2.1, 2.2, 2.4_

- [ ]* 1.2 Write property test for NOT NULL constraints
  - **Property 1: NOT NULL constraint enforcement**
  - **Validates: Requirements 2.3**

- [x] 2. Create database connection and utility modules





  - Create `src/lib/database/prisma.ts` with Prisma client singleton
  - Create `src/lib/database/retry.ts` with retry logic and exponential backoff
  - Create `src/lib/repositories/error-handler.ts` with Prisma error mapping
  - _Requirements: 1.1, 1.2, 8.1, 8.2_

- [ ]* 2.1 Write unit tests for error handling
  - Test Prisma error code mapping (P2002, P2025, P2003)
  - Test retry logic with transient failures
  - Test that validation errors don't trigger retries
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 3. Implement VideoRepository with CRUD operations





  - Create `src/lib/repositories/video-repository.ts`
  - Implement `create()` method with proper data type conversions
  - Implement `findById()` method
  - Implement `update()` method with transaction support
  - Implement `delete()` method
  - Implement `mapToVideoMetadata()` helper for type conversion
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.2, 6.4_

- [ ]* 3.1 Write property test for video creation persistence
  - **Property 4: Video creation persistence**
  - **Validates: Requirements 4.1**

- [ ]* 3.2 Write property test for update atomicity
  - **Property 6: Update atomicity**
  - **Validates: Requirements 4.3**

- [ ]* 3.3 Write property test for deletion completeness
  - **Property 7: Deletion completeness**
  - **Validates: Requirements 4.4**

- [ ]* 3.4 Write property test for return type consistency
  - **Property 14: Return type consistency**
  - **Validates: Requirements 6.2**

- [ ]* 3.5 Write property test for date type conversion
  - **Property 15: Date type conversion**
  - **Validates: Requirements 6.4**

- [ ]* 3.6 Write unit tests for CRUD operations
  - Test creating video with valid data
  - Test retrieving video by ID
  - Test updating video metadata
  - Test deleting video
  - Test handling not found cases
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Implement search and filtering functionality
  - Implement `findAll()` method with filter support
  - Implement `findPaginated()` method with pagination
  - Implement `buildWhereClause()` helper for filter construction
  - Add support for category filtering
  - Add support for tag filtering with array operations
  - Add support for text search (title, description, tags)
  - Add support for isPublic filtering
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 4.1 Write property test for filter correctness
  - **Property 5: Filter correctness**
  - **Validates: Requirements 4.2**

- [ ]* 4.2 Write property test for text search completeness
  - **Property 9: Text search completeness**
  - **Validates: Requirements 5.1**

- [ ]* 4.3 Write property test for category filter exactness
  - **Property 10: Category filter exactness**
  - **Validates: Requirements 5.2**

- [ ]* 4.4 Write property test for tag filter inclusiveness
  - **Property 11: Tag filter inclusiveness**
  - **Validates: Requirements 5.3**

- [ ]* 4.5 Write property test for pagination correctness
  - **Property 12: Pagination correctness**
  - **Validates: Requirements 5.4**

- [ ]* 4.6 Write property test for sort order correctness
  - **Property 13: Sort order correctness**
  - **Validates: Requirements 5.5**

- [ ] 5. Implement additional repository methods
  - Implement `incrementViewCount()` method with atomic increment
  - Implement `getStats()` method with aggregation queries
  - Use Prisma transactions for complex operations
  - _Requirements: 4.3, 4.5_

- [ ]* 5.1 Write property test for concurrent operation safety
  - **Property 8: Concurrent operation safety**
  - **Validates: Requirements 4.5**

- [ ]* 5.2 Write unit tests for statistics
  - Test getStats returns correct counts
  - Test getStats aggregates view counts correctly
  - Test getStats groups by category correctly
  - _Requirements: 4.2_

- [ ] 6. Create data migration script
  - Create `scripts/migrate-json-to-postgres.ts`
  - Implement JSON file reading
  - Implement data transformation with proper type conversions
  - Implement date string to timestamp conversion
  - Implement record insertion with error handling
  - Add verification step to compare record counts
  - Add JSON backup creation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 6.1 Write property test for migration data transformation
  - **Property 2: Migration data transformation correctness**
  - **Validates: Requirements 3.2**

- [ ]* 6.2 Write property test for date conversion
  - **Property 3: Date conversion correctness**
  - **Validates: Requirements 3.3**

- [ ]* 6.3 Write unit tests for migration script
  - Test migrating sample JSON data
  - Test record count verification
  - Test handling empty JSON file
  - Test backup file creation
  - _Requirements: 3.1, 3.4, 3.5_

- [x] 7. Update VideoService to use VideoRepository




  - Modify `src/lib/services/video-service.ts`
  - Replace `VideoDatabaseService` with `VideoRepository`
  - Update constructor to instantiate VideoRepository
  - Ensure all method signatures remain unchanged
  - Ensure return types match VideoMetadata interface
  - Maintain existing error handling behavior
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 7.1 Write unit tests for API compatibility
  - Test VideoService method signatures unchanged
  - Test return types match VideoMetadata interface
  - Test error types match previous implementation
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8. Implement error handling and constraint validation
  - Add constraint violation error handling in repository
  - Implement user-friendly error messages for common errors
  - Add transaction rollback handling
  - Test duplicate filename rejection
  - Test NULL constraint violations
  - _Requirements: 8.3, 8.4_

- [ ]* 8.1 Write property test for constraint violation errors
  - **Property 16: Constraint violation error clarity**
  - **Validates: Requirements 8.3**

- [ ]* 8.2 Write property test for transaction rollback
  - **Property 17: Transaction rollback completeness**
  - **Validates: Requirements 8.4**

- [ ] 9. Set up test database infrastructure
  - Update `vitest.config.ts` to support database tests
  - Create `src/test-setup-db.ts` with test database setup
  - Add beforeAll hook to run migrations on test database
  - Add beforeEach hook to clean database between tests
  - Add afterAll hook to disconnect Prisma client
  - Configure separate DATABASE_URL_TEST environment variable
  - _Requirements: 10.1_

- [ ] 10. Implement database health checks and monitoring
  - Create `src/lib/database/health-check.ts`
  - Implement database connectivity check
  - Implement schema integrity verification
  - Add health check API endpoint at `/api/health/database`
  - Configure Prisma query logging for development
  - _Requirements: 9.1, 9.2_

- [ ]* 10.1 Write unit tests for health checks
  - Test health check returns success when database is available
  - Test health check returns error when database is unavailable
  - Test schema integrity verification
  - _Requirements: 9.1, 9.2_

- [ ] 11. Update environment configuration
  - Add DATABASE_URL to `.env.example`
  - Add DATABASE_URL_TEST to `.env.example`
  - Document connection string format in README
  - Add instructions for local PostgreSQL setup
  - Document SSL configuration for production
  - _Requirements: 7.1, 7.3, 7.5_

- [ ]* 11.1 Write unit test for environment configuration
  - Test system reads DATABASE_URL from environment
  - Test system supports different connection strings per environment
  - _Requirements: 7.1, 7.3_

- [ ] 12. Run data migration and verify
  - Execute migration script: `npx tsx scripts/migrate-json-to-postgres.ts`
  - Verify all records migrated successfully
  - Verify record count matches JSON file
  - Verify data integrity by spot-checking records
  - Confirm backup file created
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 13. Integration testing and validation
  - Run all existing video service tests
  - Verify frontend components work without changes
  - Test video upload flow end-to-end
  - Test video retrieval and playback
  - Test video search and filtering
  - Test video deletion
  - Test admin interface functionality
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 14. Performance testing and optimization
  - Test query performance with larger datasets
  - Verify indexes are being used (check query plans)
  - Test pagination performance
  - Test concurrent access scenarios
  - Optimize slow queries if needed
  - _Requirements: 5.4, 5.5_

- [ ] 15. Documentation and cleanup
  - Update README with PostgreSQL setup instructions
  - Document migration process
  - Document rollback procedure
  - Add JSDoc comments to repository methods
  - Archive old `video-database.ts` file
  - Update API documentation if needed
  - _Requirements: 1.4, 3.5_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
