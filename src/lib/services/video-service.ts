import { VideoMetadata, VideoUploadRequest, VideoUpdateRequest, VideoSearchFilters, PaginatedVideoResponse } from '@/types/video';
import { FileStorageService } from '@/lib/storage/file-storage';
import { VideoDatabaseService } from '@/lib/storage/video-database';

export class VideoService {
  private fileStorage: FileStorageService;
  private database: VideoDatabaseService;

  constructor() {
    this.fileStorage = new FileStorageService();
    this.database = new VideoDatabaseService();
  }

  /**
   * Upload a new video
   */
  async uploadVideo(
    file: File | Buffer,
    uploadRequest: VideoUploadRequest,
    originalName: string,
    mimeType: string
  ): Promise<VideoMetadata> {
    try {
      // Validate file format
      if (!this.fileStorage.isValidVideoFormat(mimeType)) {
        throw new Error('Invalid video format. Supported formats: MP4, WebM, MOV, AVI');
      }

      // Validate file size
      const fileSize = file instanceof File ? file.size : file.length;
      if (fileSize > this.fileStorage.getMaxFileSize()) {
        throw new Error('File size exceeds maximum limit of 500MB');
      }

      // Generate unique ID and filename
      const videoId = this.generateUniqueId();
      const filename = this.fileStorage.generateUniqueFilename(originalName, videoId);

      // Convert File to Buffer if needed
      const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

      // Store the video file
      const filePath = await this.fileStorage.storeVideoFile(buffer, filename);

      // Create video metadata
      const videoMetadata: Omit<VideoMetadata, 'uploadDate' | 'lastModified' | 'viewCount'> = {
        id: videoId,
        title: uploadRequest.title,
        description: uploadRequest.description,
        filename,
        originalName,
        mimeType,
        size: fileSize,
        tags: uploadRequest.tags,
        category: uploadRequest.category,
        isPublic: uploadRequest.isPublic
      };

      // Save to database
      const savedVideo = await this.database.createVideo(videoMetadata);

      return savedVideo;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  }

  /**
   * Get video by ID
   */
  async getVideoById(id: string): Promise<VideoMetadata | null> {
    try {
      return await this.database.getVideoById(id);
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
      return await this.database.updateVideo(id, updates);
    } catch (error) {
      console.error('Failed to update video:', error);
      throw error;
    }
  }

  /**
   * Delete video (both file and database entry)
   */
  async deleteVideo(id: string): Promise<boolean> {
    try {
      // Get video metadata first
      const video = await this.database.getVideoById(id);
      if (!video) {
        return false;
      }

      // Delete from database first
      const deleted = await this.database.deleteVideo(id);
      if (!deleted) {
        return false;
      }

      // Delete video file
      try {
        await this.fileStorage.deleteVideoFile(video.filename);
      } catch (error) {
        console.error('Failed to delete video file, but database entry was removed:', error);
        // Continue execution as database cleanup was successful
      }

      // Delete thumbnail if exists
      if (video.thumbnail) {
        try {
          const thumbnailFilename = this.fileStorage.generateThumbnailFilename(video.id);
          await this.fileStorage.deleteThumbnailFile(thumbnailFilename);
        } catch (error) {
          console.error('Failed to delete thumbnail file:', error);
          // Continue execution as this is not critical
        }
      }

      return true;
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
      return await this.database.getAllVideos(filters);
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
      return await this.database.getPaginatedVideos(page, limit, filters);
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
      return await this.database.getPaginatedVideos(page, limit, { isPublic: true });
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
      return await this.database.getPaginatedVideos(page, limit, filters);
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
      await this.database.incrementViewCount(id);
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
      return await this.database.getVideoStats();
    } catch (error) {
      console.error('Failed to get video stats:', error);
      throw error;
    }
  }

  /**
   * Validate video file
   */
  validateVideoFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.fileStorage.getMaxFileSize()) {
      return {
        isValid: false,
        error: 'File size exceeds maximum limit of 500MB'
      };
    }

    // Check file format
    if (!this.fileStorage.isValidVideoFormat(file.type)) {
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
    return this.fileStorage.getMaxFileSize();
  }

  /**
   * Get maximum file size in human readable format
   */
  getMaxFileSizeFormatted(): string {
    const sizeInMB = this.fileStorage.getMaxFileSize() / (1024 * 1024);
    return `${sizeInMB}MB`;
  }

  /**
   * Generate a unique ID
   */
  private generateUniqueId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}