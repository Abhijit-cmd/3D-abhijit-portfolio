import { describe, it, expect } from 'vitest';
import { DatabaseError, handlePrismaError } from '@/lib/repositories/error-handler';
import { withRetry } from '@/lib/database/retry';

describe('Database Connection and Utility Modules', () => {
  describe('DatabaseError', () => {
    it('should create a DatabaseError with message, code, and originalError', () => {
      const originalError = new Error('Original error');
      const dbError = new DatabaseError('Test error', 'TEST_CODE', originalError);

      expect(dbError.message).toBe('Test error');
      expect(dbError.code).toBe('TEST_CODE');
      expect(dbError.originalError).toBe(originalError);
      expect(dbError.name).toBe('DatabaseError');
    });
  });

  describe('handlePrismaError', () => {
    it('should handle P2002 (unique constraint violation) error', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
        meta: { target: ['filename'] },
        message: 'Unique constraint failed',
      };

      expect(() => handlePrismaError(prismaError)).toThrow(DatabaseError);
      expect(() => handlePrismaError(prismaError)).toThrow('A video with this filename already exists');
    });

    it('should handle P2025 (record not found) error', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2025',
        message: 'Record not found',
      };

      expect(() => handlePrismaError(prismaError)).toThrow(DatabaseError);
      expect(() => handlePrismaError(prismaError)).toThrow('Video not found');
    });

    it('should handle P2003 (foreign key constraint) error', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2003',
        message: 'Foreign key constraint failed',
      };

      expect(() => handlePrismaError(prismaError)).toThrow(DatabaseError);
      expect(() => handlePrismaError(prismaError)).toThrow('Foreign key constraint violation');
    });

    it('should handle P2011 (null constraint violation) error', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2011',
        meta: { column_name: 'title' },
        message: 'Null constraint violation',
      };

      expect(() => handlePrismaError(prismaError)).toThrow(DatabaseError);
      expect(() => handlePrismaError(prismaError)).toThrow("Required field 'title' cannot be null");
    });

    it('should handle validation errors', () => {
      const validationError = {
        name: 'PrismaClientValidationError',
        message: 'Invalid data',
      };

      expect(() => handlePrismaError(validationError)).toThrow(DatabaseError);
      expect(() => handlePrismaError(validationError)).toThrow('Invalid data provided to database operation');
    });

    it('should handle initialization errors', () => {
      const initError = {
        name: 'PrismaClientInitializationError',
        message: 'Failed to connect',
      };

      expect(() => handlePrismaError(initError)).toThrow(DatabaseError);
      expect(() => handlePrismaError(initError)).toThrow('Failed to initialize database connection');
    });

    it('should re-throw DatabaseError instances', () => {
      const dbError = new DatabaseError('Test error', 'TEST_CODE');

      expect(() => handlePrismaError(dbError)).toThrow(dbError);
    });

    it('should wrap unknown errors', () => {
      const unknownError = new Error('Unknown error');

      expect(() => handlePrismaError(unknownError)).toThrow(DatabaseError);
      expect(() => handlePrismaError(unknownError)).toThrow('Unknown error');
    });
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      const operation = async () => 'success';

      const result = await withRetry(operation);

      expect(result).toBe('success');
    });

    it('should retry on transient failures and eventually succeed', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Transient error');
        }
        return 'success';
      };

      const result = await withRetry(operation, 3, 10);

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should not retry on validation errors', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        const error: any = new Error('Validation error');
        error.name = 'PrismaClientValidationError';
        throw error;
      };

      await expect(withRetry(operation, 3, 10)).rejects.toThrow('Validation error');
      expect(attempts).toBe(1);
    });

    it('should not retry on P2002 (unique constraint) errors', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        const error: any = new Error('Unique constraint');
        error.name = 'PrismaClientKnownRequestError';
        error.code = 'P2002';
        throw error;
      };

      await expect(withRetry(operation, 3, 10)).rejects.toThrow('Unique constraint');
      expect(attempts).toBe(1);
    });

    it('should not retry on P2025 (not found) errors', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        const error: any = new Error('Not found');
        error.name = 'PrismaClientKnownRequestError';
        error.code = 'P2025';
        throw error;
      };

      await expect(withRetry(operation, 3, 10)).rejects.toThrow('Not found');
      expect(attempts).toBe(1);
    });

    it('should throw last error after max attempts', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        throw new Error(`Attempt ${attempts} failed`);
      };

      await expect(withRetry(operation, 3, 10)).rejects.toThrow('Attempt 3 failed');
      expect(attempts).toBe(3);
    });

    it('should use exponential backoff between retries', async () => {
      const timestamps: number[] = [];
      const operation = async () => {
        timestamps.push(Date.now());
        if (timestamps.length < 3) {
          throw new Error('Retry');
        }
        return 'success';
      };

      await withRetry(operation, 3, 50);

      // Check that delays increase exponentially (with some tolerance for timing)
      expect(timestamps.length).toBe(3);
      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];
      
      // First delay should be ~50ms, second should be ~100ms
      expect(delay1).toBeGreaterThanOrEqual(40);
      expect(delay2).toBeGreaterThanOrEqual(80);
      expect(delay2).toBeGreaterThan(delay1);
    });
  });
});
