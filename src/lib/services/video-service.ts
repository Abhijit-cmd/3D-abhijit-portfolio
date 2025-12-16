import { VideoMetadata, VideoUploadRequest, VideoUpdateRequest, VideoSearchFilters, PaginatedVideoResponse } from '@/types/video';
import { VideoRepository } from '@/lib/repositories/video-repository';

export class VideoService {
  private repository: VideoRepository;

  constructor() {
    this.repository = new VideoRepository();
  }

  /**
   * Upload a new video
   * Note: File upload is not supported on Vercel (read-only filesystem)
   * This would need to be implemented with Vercel Blob or similar cloud storage
   */
  async uploadVideo(
    file: File | Buffer,
    uploadRequest: VideoUploadRequest,
    originalName: string,
    mimeType: string
  ): Promise<VideoMetadata> {
    throw new Error('Video upload is not supported in production. Please use cloud storage like Vercel Blob.');
  }

  /**
   * Get video by ID
   */
  async getVideoById(id: string): Promise<VideoMetadata | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      console.error('Failed to get video by ID:', error);
      throw error;
    }
  }

  /**
   * Update video metadata
   */
  async updateVideo(id: string, updates: VideoUpdateRequest): Promise<VideoMetadata | null> {
    try {
      return await this.repository.update(id, updates);
    } catch (error) {
      console.error('Failed to update video:', error);
      throw error;
    }
  }

  /**
   * Delete video from database
   */
  async deleteVideo(id: string): Promise<boolean> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      console.error('Failed to delete video:', error);
      throw error;
    }
  }

  /**
   * Get all videos with optional filtering
   */
  async getAllVideos(filters?: VideoSearchFilters): Promise<VideoMetadata[]> {
    try {
      return await this.repository.findAll(filters);
    } catch (error) {
      console.error('Failed to get all videos:', error);
      throw error;
    }
  }

  /**
   * Get paginated videos
   */
  async getPaginatedVideos(
    page: number = 1,
    limit: number = 12,
    filters?: VideoSearchFilters
  ): Promise<PaginatedVideoResponse> {
    try {
      return await this.repository.findPaginated(page, limit, filters);
    } catch (error) {
      console.error('Failed to get paginated videos:', error);
      throw error;
    }
  }

  /**
   * Get public videos only
   */
  async getPublicVideos(page: number = 1, limit: number = 12): Promise<PaginatedVideoResponse> {
    try {
      return await this.repository.findPaginated(page, limit, { isPublic: true });
    } catch (error) {
      console.error('Failed to get public videos:', error);
      throw error;
    }
  }

  /**
   * Search videos
   */
  async searchVideos(
    searchTerm: string,
    page: number = 1,
    limit: number = 12,
    additionalFilters?: Omit<VideoSearchFilters, 'searchTerm'>
  ): Promise<PaginatedVideoResponse> {
    try {
      const filters: VideoSearchFilters = {
        ...additionalFilters,
        searchTerm
      };
      return await this.repository.findPaginated(page, limit, filters);
    } catch (error) {
      console.error('Failed to search videos:', error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      await this.repository.incrementViewCount(id);
    } catch (error) {
      console.error('Failed to increment view count:', error);
      // Don't throw error for view count failures
    }
  }

  /**
   * Get video statistics
   */
  async getVideoStats() {
    try {
      return await this.repository.getStats();
    } catch (error) {
      console.error('Failed to get video stats:', error);
      throw error;
    }
  }

  /**
   * Validate video file
   */
  validateVideoFile(file: File): { isValid: boolean; error?: string } {
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    const SUPPORTED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File size exceeds maximum limit of 500MB'
      };
    }

    // Check file format
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid video format. Supported formats: MP4, WebM, MOV, AVI'
      };
    }

    return { isValid: true };
  }

  /**
   * Get supported video formats
   */
  getSupportedFormats(): string[] {
    return ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  }

  /**
   * Get maximum file size in bytes
   */
  getMaxFileSize(): number {
    return 500 * 1024 * 1024; // 500MB
  }

  /**
   * Get maximum file size in human readable format
   */
  getMaxFileSizeFormatted(): string {
    return '500MB';
  }

  /**
   * Generate a unique ID
   */
  private generateUniqueId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
