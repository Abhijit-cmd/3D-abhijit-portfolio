import { promises as fs } from 'fs';
import path from 'path';
import { VideoMetadata } from '@/types/video';

export class FileStorageService {
  private readonly uploadsDir: string;
  private readonly thumbnailsDir: string;

  constructor() {
    // In development, store files in public/uploads
    // In production, this would be configured to use cloud storage
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    this.thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
  }

  /**
   * Initialize storage directories
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.thumbnailsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize storage directories:', error);
      throw new Error('Storage initialization failed');
    }
  }

  /**
   * Store a video file
   */
  async storeVideoFile(buffer: Buffer, filename: string): Promise<string> {
    try {
      await this.initialize();
      const filePath = path.join(this.uploadsDir, filename);
      await fs.writeFile(filePath, buffer);
      return `/uploads/videos/${filename}`;
    } catch (error) {
      console.error('Failed to store video file:', error);
      throw new Error('Video file storage failed');
    }
  }

  /**
   * Store a thumbnail file
   */
  async storeThumbnailFile(buffer: Buffer, filename: string): Promise<string> {
    try {
      await this.initialize();
      const filePath = path.join(this.thumbnailsDir, filename);
      await fs.writeFile(filePath, buffer);
      return `/uploads/thumbnails/${filename}`;
    } catch (error) {
      console.error('Failed to store thumbnail file:', error);
      throw new Error('Thumbnail file storage failed');
    }
  }

  /**
   * Delete a video file
   */
  async deleteVideoFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete video file:', error);
      throw new Error('Video file deletion failed');
    }
  }

  /**
   * Delete a thumbnail file
   */
  async deleteThumbnailFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.thumbnailsDir, filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete thumbnail file:', error);
      // Don't throw error for thumbnail deletion as it's not critical
      console.warn('Thumbnail deletion failed, continuing...');
    }
  }

  /**
   * Check if a video file exists
   */
  async videoFileExists(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get video file stats
   */
  async getVideoFileStats(filename: string): Promise<{ size: number; mtime: Date } | null> {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        mtime: stats.mtime
      };
    } catch {
      return null;
    }
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName: string, videoId: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    return `${videoId}_${timestamp}${ext}`;
  }

  /**
   * Generate thumbnail filename
   */
  generateThumbnailFilename(videoId: string): string {
    return `${videoId}_thumbnail.jpg`;
  }

  /**
   * Validate video file format
   */
  isValidVideoFormat(mimeType: string): boolean {
    const allowedFormats = [
      'video/mp4',
      'video/webm',
      'video/quicktime', // .mov files
      'video/x-msvideo', // .avi files
    ];
    return allowedFormats.includes(mimeType);
  }

  /**
   * Get maximum file size (in bytes)
   */
  getMaxFileSize(): number {
    // 500MB default limit
    return 500 * 1024 * 1024;
  }

  /**
   * Get full path to video file
   */
  getVideoFilePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }

  /**
   * Get full path to thumbnail file
   */
  getThumbnailFilePath(filename: string): string {
    return path.join(this.thumbnailsDir, filename);
  }
}