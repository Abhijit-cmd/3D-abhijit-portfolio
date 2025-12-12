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
<<<<<<< HEAD
  category: 'gameplay' | 'funny_moments';
=======
  category: 'gameplay' | 'tutorial' | 'review' | 'stream';
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
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
<<<<<<< HEAD
  thumbnail?: string;
=======
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
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