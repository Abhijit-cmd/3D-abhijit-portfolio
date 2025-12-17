import { StorageService } from './types';
import { LocalStorageService } from './local-storage-service';
import { BlobStorageService } from './blob-storage-service';

/**
 * Create the appropriate storage service based on environment
 * - Production: Uses Vercel Blob storage
 * - Development: Uses local filesystem storage
 */
export function createStorageService(): StorageService {
  if (process.env.NODE_ENV === 'production') {
    return new BlobStorageService();
  }
  return new LocalStorageService();
}
