/**
 * Custom database error class with error codes
 */
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

/**
 * Map Prisma errors to user-friendly DatabaseError instances
 * 
 * @param error - The error to handle
 * @throws DatabaseError with appropriate message and code
 */
export function handlePrismaError(error: unknown): never {
  const errorName = (error as any)?.name || '';
  const errorCode = (error as any)?.code || '';
  const errorMeta = (error as any)?.meta;
  const errorMessage = (error as any)?.message || '';

  // Handle known Prisma errors with specific error codes
  if (errorName === 'PrismaClientKnownRequestError') {
    switch (errorCode) {
      case 'P2002':
        // Unique constraint violation
        const target = (errorMeta?.target as string[]) || [];
        const field = target.length > 0 ? target[0] : 'field';
        throw new DatabaseError(
          `A video with this ${field} already exists`,
          'DUPLICATE_FILENAME',
          error
        );
      
      case 'P2025':
        // Record not found
        throw new DatabaseError(
          'Video not found',
          'NOT_FOUND',
          error
        );
      
      case 'P2003':
        // Foreign key constraint violation
        throw new DatabaseError(
          'Foreign key constraint violation',
          'CONSTRAINT_VIOLATION',
          error
        );
      
      case 'P2000':
        // Value too long for column
        throw new DatabaseError(
          'The provided value is too long for the database field',
          'VALUE_TOO_LONG',
          error
        );
      
      case 'P2011':
        // Null constraint violation
        const nullField = (errorMeta?.column_name as string) || 'field';
        throw new DatabaseError(
          `Required field '${nullField}' cannot be null`,
          'NULL_CONSTRAINT_VIOLATION',
          error
        );
      
      case 'P2012':
        // Missing required value
        throw new DatabaseError(
          'A required value is missing',
          'MISSING_REQUIRED_VALUE',
          error
        );
      
      default:
        // Unknown Prisma error
        throw new DatabaseError(
          `Database operation failed: ${errorMessage}`,
          'UNKNOWN_ERROR',
          error
        );
    }
  }

  // Handle validation errors
  if (errorName === 'PrismaClientValidationError') {
    throw new DatabaseError(
      'Invalid data provided to database operation',
      'VALIDATION_ERROR',
      error
    );
  }

  // Handle initialization errors
  if (errorName === 'PrismaClientInitializationError') {
    throw new DatabaseError(
      'Failed to initialize database connection',
      'INITIALIZATION_ERROR',
      error
    );
  }

  // Handle connection errors
  if (errorName === 'PrismaClientRustPanicError') {
    throw new DatabaseError(
      'Database connection panic occurred',
      'CONNECTION_PANIC',
      error
    );
  }

  // If it's already a DatabaseError, re-throw it
  if (error instanceof DatabaseError) {
    throw error;
  }

  // For any other error type, wrap it in a generic DatabaseError
  throw new DatabaseError(
    (error as Error)?.message || 'An unknown database error occurred',
    'UNKNOWN_ERROR',
    error
  );
}
