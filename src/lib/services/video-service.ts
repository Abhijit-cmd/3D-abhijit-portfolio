import { VideoMetadata, VideoUploadRequest, VideoUpdateRequest, VideoSearchFilters, PaginatedVideoResponse } from '@/types/video';
import { VideoRepository } from '@/lib/repositories/video-repository';
import { StorageService, createStorageService } from './storage';
import { validateVideoFile, validateThumbnailFile, generateUniqueFilename } from '@/lib/utils/file-validation';

export class VideoService {
  private repository: VideoRepository;
  private storageService: StorageService;

  constructor(storageService?: StorageService) {
    this.repository = new VideoRepository();
    this.storageService = storageService || createStorageService();
  }

  /**
   * Upload a new video with thumbnail
   */
  async uploadVideo(
    videoFile: File,
    uploadRequest: VideoUploadRequest,
    thumbnailFile?: File
  ): Promise<VideoMetadata> {
    // Validate video file
    const videoValidation = validateVideoFile(videoFile);
    if (!videoValidation.valid) {
      throw videoValidation.error;
    }

    // Validate thumbnail if provided
    if (thumbnailFile) {
      const thumbnailValidation = validateThumbnailFile(thumbnailFile);
      if (!thumbnailValidation.valid) {
        throw thumbnailValidation.error;
      }
    }

    try {
      // Generate unique filenames
      const videoFilename = generateUniqueFilename(videoFile.name);
      const thumbnailFilename = thumbnailFile 
        ? generateUniqueFilename(thumbnailFile.name)
        : 'default-thumbnail.jpg';

      // Upload video to storage
      const videoUrl = await this.storageService.uploadVideo(videoFile, videoFilename);

      // Upload thumbnail to storage
      let thumbnailUrl: string;
      if (thumbnailFile) {
        thumbnailUrl = await this.storageService.uploadThumbnail(thumbnailFile, thumbnailFilename);
      } else {
        // Use default thumbnail
        thumbnailUrl = '/assets/default-video-thumbnail.jpg';
      }

      // Create video record in database
      const videoMetadata = await this.repository.create({
        id: this.generateUniqueId(),
        ...uploadRequest,
        filename: videoUrl,
        originalName: videoFile.name,
        mimeType: videoFile.type,
        size: videoFile.size,
        thumbnail: thumbnailUrl,
        tags: uploadRequest.tags || [],
      });

      return videoMetadata;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw error;
    }
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
   * Delete video from database and storage
   */
  async deleteVideo(id: string): Promise<boolean> {
    try {
      // Get video metadata first to get URLs
      const video = await this.repository.findById(id);
      if (!video) {
        return false;
      }

      // Delete from storage
      await this.storageService.deleteVideo(video.filename);
      if (video.thumbnail) {
        await this.storageService.deleteThumbnail(video.thumbnail);
      }

      // Delete from database
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
