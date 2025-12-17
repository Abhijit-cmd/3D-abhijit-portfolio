/**
 * Storage service interface for handling video and thumbnail uploads
 * Supports both local filesystem (development) and Vercel Blob (production)
 */
export interface StorageService {
  /**
   * Upload a video file to storage
   * @param file - The video file to upload
   * @param filename - The desired filename
   * @returns The URL or path to the uploaded video
   */
  uploadVideo(file: File, filename: string): Promise<string>;

  /**
   * Upload a thumbnail image to storage
   * @param file - The thumbnail file to upload
   * @param filename - The desired filename
   * @returns The URL or path to the uploaded thumbnail
   */
  uploadThumbnail(file: File, filename: string): Promise<string>;

  /**
   * Delete a video from storage
   * @param url - The URL or path of the video to delete
   */
  deleteVideo(url: string): Promise<void>;

  /**
   * Delete a thumbnail from storage
   * @param url - The URL or path of the thumbnail to delete
   */
  deleteThumbnail(url: string): Promise<void>;

  /**
   * Get the full URL for a video
   * @param identifier - The video identifier (path or URL)
   * @returns The full URL to access the video
   */
  getVideoUrl(identifier: string): string;

  /**
   * Get the full URL for a thumbnail
   * @param identifier - The thumbnail identifier (path or URL)
   * @returns The full URL to access the thumbnail
   */
  getThumbnailUrl(identifier: string): string;
}

/**
 * Storage configuration constants
 */
export const STORAGE_CONFIG = {
  // Maximum video file size: 100MB
  maxVideoSize: 100 * 1024 * 1024,
  
  // Maximum thumbnail file size: 5MB
  maxThumbnailSize: 5 * 1024 * 1024,
  
  // Allowed video MIME types
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  
  // Allowed image MIME types for thumbnails
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

/**
 * Storage error types
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'DELETE_FAILED' | 'NOT_FOUND',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'StorageError';
  }
}
