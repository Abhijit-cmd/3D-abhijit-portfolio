import { promises as fs } from 'fs';
import path from 'path';
import { VideoMetadata, VideoSearchFilters, PaginatedVideoResponse } from '@/types/video';

export class VideoDatabaseService {
  private readonly dbPath: string;
  private videosCache: VideoMetadata[] | null = null;

  constructor() {
    // Store database in data directory
    this.dbPath = path.join(process.cwd(), 'src', 'data', 'videos.json');
  }

  /**
   * Initialize database file
   */
  private async initializeDatabase(): Promise<void> {
    try {
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });
      
      // Check if database file exists
      try {
        await fs.access(this.dbPath);
      } catch {
        // Create empty database file
        await fs.writeFile(this.dbPath, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error('Failed to initialize video database:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Load videos from database
   */
  private async loadVideos(): Promise<VideoMetadata[]> {
    try {
      await this.initializeDatabase();
      const data = await fs.readFile(this.dbPath, 'utf-8');
      const videos = JSON.parse(data) as VideoMetadata[];
      
      // Convert date strings back to Date objects
      return videos.map(video => ({
        ...video,
        uploadDate: new Date(video.uploadDate),
        lastModified: new Date(video.lastModified)
      }));
    } catch (error) {
      console.error('Failed to load videos from database:', error);
      throw new Error('Database read failed');
    }
  }

  /**
   * Save videos to database
   */
  private async saveVideos(videos: VideoMetadata[]): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(videos, null, 2));
      this.videosCache = videos; // Update cache
    } catch (error) {
      console.error('Failed to save videos to database:', error);
      throw new Error('Database write failed');
    }
  }

  /**
   * Get all videos with caching
   */
  private async getVideos(): Promise<VideoMetadata[]> {
    if (this.videosCache === null) {
      this.videosCache = await this.loadVideos();
    }
    return this.videosCache;
  }

  /**
   * Create a new video entry
   */
  async createVideo(videoData: Omit<VideoMetadata, 'uploadDate' | 'lastModified' | 'viewCount'>): Promise<VideoMetadata> {
    try {
      const videos = await this.getVideos();
      
      // Check if video with same ID already exists
      if (videos.some(v => v.id === videoData.id)) {
        throw new Error(`Video with ID ${videoData.id} already exists`);
      }

      const newVideo: VideoMetadata = {
        ...videoData,
        uploadDate: new Date(),
        lastModified: new Date(),
        viewCount: 0
      };

      videos.push(newVideo);
      await this.saveVideos(videos);
      
      return newVideo;
    } catch (error) {
      console.error('Failed to create video:', error);
      throw error;
    }
  }

  /**
   * Get video by ID
   */
  async getVideoById(id: string): Promise<VideoMetadata | null> {
    try {
      const videos = await this.getVideos();
      return videos.find(video => video.id === id) || null;
    } catch (error) {
      console.error('Failed to get video by ID:', error);
      throw error;
    }
  }

  /**
   * Update video metadata
   */
  async updateVideo(id: string, updates: Partial<VideoMetadata>): Promise<VideoMetadata | null> {
    try {
      const videos = await this.getVideos();
      const videoIndex = videos.findIndex(video => video.id === id);
      
      if (videoIndex === -1) {
        return null;
      }

      const updatedVideo: VideoMetadata = {
        ...videos[videoIndex],
        ...updates,
        lastModified: new Date()
      };

      videos[videoIndex] = updatedVideo;
      await this.saveVideos(videos);
      
      return updatedVideo;
    } catch (error) {
      console.error('Failed to update video:', error);
      throw error;
    }
  }

  /**
   * Delete video by ID
   */
  async deleteVideo(id: string): Promise<boolean> {
    try {
      const videos = await this.getVideos();
      const initialLength = videos.length;
      const filteredVideos = videos.filter(video => video.id !== id);
      
      if (filteredVideos.length === initialLength) {
        return false; // Video not found
      }

      await this.saveVideos(filteredVideos);
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
      let videos = await this.getVideos();

      if (filters) {
        videos = this.applyFilters(videos, filters);
      }

      // Sort by upload date (newest first)
      return videos.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
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
      const allVideos = await this.getAllVideos(filters);
      const totalCount = allVideos.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const videos = allVideos.slice(startIndex, endIndex);

      return {
        videos,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      console.error('Failed to get paginated videos:', error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      const video = await this.getVideoById(id);
      if (video) {
        await this.updateVideo(id, { viewCount: video.viewCount + 1 });
      }
    } catch (error) {
      console.error('Failed to increment view count:', error);
      // Don't throw error for view count increment failures
    }
  }

  /**
   * Apply filters to video list
   */
  private applyFilters(videos: VideoMetadata[], filters: VideoSearchFilters): VideoMetadata[] {
    return videos.filter(video => {
      // Category filter
      if (filters.category && video.category !== filters.category) {
        return false;
      }

      // Public/private filter
      if (filters.isPublic !== undefined && video.isPublic !== filters.isPublic) {
        return false;
      }

      // Tags filter (video must have at least one of the specified tags)
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          video.tags.some(videoTag => 
            videoTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Search term filter (searches in title and description)
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const titleMatch = video.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = video.description?.toLowerCase().includes(searchTerm) || false;
        const tagMatch = video.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        if (!titleMatch && !descriptionMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get video statistics
   */
  async getVideoStats(): Promise<{
    totalVideos: number;
    totalViews: number;
    categoryCounts: Record<string, number>;
    publicVideos: number;
    privateVideos: number;
  }> {
    try {
      const videos = await this.getVideos();
      
      const stats = {
        totalVideos: videos.length,
        totalViews: videos.reduce((sum, video) => sum + video.viewCount, 0),
        categoryCounts: {} as Record<string, number>,
        publicVideos: videos.filter(v => v.isPublic).length,
        privateVideos: videos.filter(v => !v.isPublic).length
      };

      // Count videos by category
      videos.forEach(video => {
        stats.categoryCounts[video.category] = (stats.categoryCounts[video.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get video stats:', error);
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.videosCache = null;
  }
}