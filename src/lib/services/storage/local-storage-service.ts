import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { StorageService, StorageError } from './types';

/**
 * Local filesystem storage service for development
 * Stores files in /public/uploads/ directory
 */
export class LocalStorageService implements StorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  private readonly videosDir = path.join(this.uploadsDir, 'videos');
  private readonly thumbnailsDir = path.join(this.uploadsDir, 'thumbnails');

  constructor() {
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure upload directories exist
   */
  private async ensureDirectoriesExist(): Promise<void> {
    try {
      if (!existsSync(this.videosDir)) {
        await mkdir(this.videosDir, { recursive: true });
      }
      if (!existsSync(this.thumbnailsDir)) {
        await mkdir(this.thumbnailsDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  async uploadVideo(file: File, filename: string): Promise<string> {
    try {
      const filePath = path.join(this.videosDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      
      // Return relative path from public directory
      return `/uploads/videos/${filename}`;
    } catch (error) {
      throw new StorageError(
        'Failed to upload video to local storage',
        'UPLOAD_FAILED',
        500
      );
    }
  }

  async uploadThumbnail(file: File, filename: string): Promise<string> {
    try {
      const filePath = path.join(this.thumbnailsDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      
      // Return relative path from public directory
      return `/uploads/thumbnails/${filename}`;
    } catch (error) {
      throw new StorageError(
        'Failed to upload thumbnail to local storage',
        'UPLOAD_FAILED',
        500
      );
    }
  }

  async deleteVideo(url: string): Promise<void> {
    try {
      // Extract filename from URL (e.g., /uploads/videos/video.mp4 -> video.mp4)
      const filename = path.basename(url);
      const filePath = path.join(this.videosDir, filename);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      // Log but don't throw - file might already be deleted
      console.warn('Failed to delete video from local storage:', error);
    }
  }

  async deleteThumbnail(url: string): Promise<void> {
    try {
      // Extract filename from URL
      const filename = path.basename(url);
      const filePath = path.join(this.thumbnailsDir, filename);
      
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      // Log but don't throw - file might already be deleted
      console.warn('Failed to delete thumbnail from local storage:', error);
    }
  }

  getVideoUrl(identifier: string): string {
    // If already a full URL, return as-is
    if (identifier.startsWith('http')) {
      return identifier;
    }
    // If relative path, return as-is (will be served by Next.js from /public)
    return identifier;
  }

  getThumbnailUrl(identifier: string): string {
    // If already a full URL, return as-is
    if (identifier.startsWith('http')) {
      return identifier;
    }
    // If relative path, return as-is (will be served by Next.js from /public)
    return identifier;
  }
}
