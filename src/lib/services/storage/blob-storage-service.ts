import { put, del } from '@vercel/blob';
import { StorageService, StorageError } from './types';

/**
 * Vercel Blob storage service for production
 * Stores files in Vercel's cloud storage
 */
export class BlobStorageService implements StorageService {
  async uploadVideo(file: File, filename: string): Promise<string> {
    try {
      const blob = await put(`videos/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      return blob.url;
    } catch (error) {
      console.error('Blob upload error:', error);
      console.error('Token available:', !!process.env.BLOB_READ_WRITE_TOKEN);
      throw new StorageError(
        'Failed to upload video to Vercel Blob',
        'UPLOAD_FAILED',
        500
      );
    }
  }

  async uploadThumbnail(file: File, filename: string): Promise<string> {
    try {
      const blob = await put(`thumbnails/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      return blob.url;
    } catch (error) {
      console.error('Blob upload error:', error);
      console.error('Token available:', !!process.env.BLOB_READ_WRITE_TOKEN);
      throw new StorageError(
        'Failed to upload thumbnail to Vercel Blob',
        'UPLOAD_FAILED',
        500
      );
    }
  }

  async deleteVideo(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      // Log but don't throw - file might already be deleted
      console.warn('Failed to delete video from Blob storage:', error);
    }
  }

  async deleteThumbnail(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      // Log but don't throw - file might already be deleted
      console.warn('Failed to delete thumbnail from Blob storage:', error);
    }
  }

  getVideoUrl(identifier: string): string {
    // Blob URLs are already full URLs
    return identifier;
  }

  getThumbnailUrl(identifier: string): string {
    // Blob URLs are already full URLs
    return identifier;
  }
}
