import { STORAGE_CONFIG, StorageError } from '../services/storage';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: StorageError;
}

/**
 * Validate a video file for upload
 * Checks file size and MIME type
 */
export function validateVideoFile(file: File): ValidationResult {
  // Check file size
  if (file.size > STORAGE_CONFIG.maxVideoSize) {
    return {
      valid: false,
      error: new StorageError(
        `Video file exceeds ${STORAGE_CONFIG.maxVideoSize / (1024 * 1024)}MB limit`,
        'FILE_TOO_LARGE',
        413
      ),
    };
  }

  // Check MIME type
  if (!STORAGE_CONFIG.allowedVideoTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: new StorageError(
        `Invalid file type. Supported formats: ${STORAGE_CONFIG.allowedVideoTypes.join(', ')}`,
        'INVALID_TYPE',
        400
      ),
    };
  }

  return { valid: true };
}

/**
 * Validate a thumbnail file for upload
 * Checks file size and MIME type
 */
export function validateThumbnailFile(file: File): ValidationResult {
  // Check file size
  if (file.size > STORAGE_CONFIG.maxThumbnailSize) {
    return {
      valid: false,
      error: new StorageError(
        `Thumbnail file exceeds ${STORAGE_CONFIG.maxThumbnailSize / (1024 * 1024)}MB limit`,
        'FILE_TOO_LARGE',
        413
      ),
    };
  }

  // Check MIME type
  if (!STORAGE_CONFIG.allowedImageTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: new StorageError(
        `Invalid file type. Supported formats: ${STORAGE_CONFIG.allowedImageTypes.join(', ')}`,
        'INVALID_TYPE',
        400
      ),
    };
  }

  return { valid: true };
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  const nameWithoutExt = originalFilename.replace(`.${extension}`, '');
  
  // Sanitize filename: remove special characters
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-');
  
  return `${sanitized}-${timestamp}-${randomSuffix}.${extension}`;
}
