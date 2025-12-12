import { VideoService } from './services/video-service';

// Singleton instance
let videoServiceInstance: VideoService | null = null;

/**
 * Get singleton instance of VideoService
 */
export function getVideoService(): VideoService {
  if (!videoServiceInstance) {
    videoServiceInstance = new VideoService();
  }
  return videoServiceInstance;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in human readable format (seconds to mm:ss)
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get video category display name
 */
export function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    gameplay: 'Gameplay',
    tutorial: 'Tutorial',
    review: 'Review',
    stream: 'Stream'
  };
  return categoryMap[category] || category;
}

/**
 * Validate video upload form data
 */
export function validateVideoUploadData(data: {
  title: string;
  description?: string;
  category: string;
  tags: string[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate title
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.trim().length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  // Validate description
  if (data.description && data.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // Validate category
  const validCategories = ['gameplay', 'tutorial', 'review', 'stream'];
  if (!validCategories.includes(data.category)) {
    errors.push('Invalid category selected');
  }

  // Validate tags
  if (data.tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  data.tags.forEach(tag => {
    if (tag.length > 20) {
      errors.push('Each tag must be less than 20 characters');
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}