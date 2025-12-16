import { VideoMetadata, VideoSearchFilters, PaginatedVideoResponse, VideoUpdateRequest } from '@/types/video';

/**
 * Client-side service for video operations
 * This service makes API calls to the server instead of directly accessing the database
 */
export class VideoClientService {
  private baseUrl = '/api/videos';

  /**
   * Get all videos with optional filters
   */
  async getAllVideos(filters?: VideoSearchFilters): Promise<VideoMetadata[]> {
    const params = new URLSearchParams();
    
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.isPublic !== undefined) {
      params.append('isPublic', String(filters.isPublic));
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    return response.json();
  }

  /**
   * Get paginated videos with optional filters
   */
  async getPaginatedVideos(
    page: number = 1,
    limit: number = 12,
    filters?: VideoSearchFilters
  ): Promise<PaginatedVideoResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.searchTerm) {
      params.append('searchTerm', filters.searchTerm);
    }
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.isPublic !== undefined) {
      params.append('isPublic', String(filters.isPublic));
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch paginated videos');
    }
    
    return response.json();
  }

  /**
   * Get a single video by ID
   */
  async getVideoById(id: string): Promise<VideoMetadata | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    
    return response.json();
  }

  /**
   * Update a video
   */
  async updateVideo(id: string, data: VideoUpdateRequest): Promise<VideoMetadata | null> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to update video');
    }
    
    return response.json();
  }

  /**
   * Delete a video
   */
  async deleteVideo(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    
    if (response.status === 404) {
      return false;
    }
    
    if (!response.ok) {
      throw new Error('Failed to delete video');
    }
    
    const result = await response.json();
    return result.success;
  }

  /**
   * Increment view count for a video
   */
  async incrementViewCount(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/view`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to increment view count');
    }
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
    const response = await fetch(`${this.baseUrl}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch video stats');
    }
    
    return response.json();
  }
}
