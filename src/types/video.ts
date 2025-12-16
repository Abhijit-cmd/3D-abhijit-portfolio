export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  thumbnail?: string;
  uploadDate: Date;
  lastModified: Date;
  tags: string[];
  category: 'gameplay' | 'funny_moments' | 'tutorial' | 'review' | 'stream';
  isPublic: boolean;
  viewCount: number;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  estimatedTimeRemaining?: number;
}

export interface VideoUploadRequest {
  title: string;
  description?: string;
  category: VideoMetadata['category'];
  tags: string[];
  isPublic: boolean;
}

export interface VideoUpdateRequest {
  title?: string;
  description?: string;
  category?: VideoMetadata['category'];
  tags?: string[];
  isPublic?: boolean;
  thumbnail?: string;
}

export interface VideoSearchFilters {
  category?: VideoMetadata['category'];
  tags?: string[];
  isPublic?: boolean;
  searchTerm?: string;
}

export interface PaginatedVideoResponse {
  videos: VideoMetadata[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}