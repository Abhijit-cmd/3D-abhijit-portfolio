/**
 * Execute a database operation with retry logic and exponential backoff
 * 
 * @param operation - The async operation to execute
 * @param maxAttempts - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds for exponential backoff (default: 1000ms)
 * @returns The result of the operation
 * @throws The last error encountered if all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors or constraint violations
      // These are permanent errors that won't be fixed by retrying
      const errorName = (error as any)?.name || '';
      const errorCode = (error as any)?.code || '';
      
      if (
        errorName === 'PrismaClientValidationError' ||
        (errorName === 'PrismaClientKnownRequestError' &&
          ['P2002', 'P2003', 'P2025'].includes(errorCode))
      ) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt >= maxAttempts) {
        throw lastError;
      }

      // Calculate exponential backoff delay: baseDelay * 2^(attempt-1)
      // Attempt 1: 1000ms, Attempt 2: 2000ms, Attempt 3: 4000ms
      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}
