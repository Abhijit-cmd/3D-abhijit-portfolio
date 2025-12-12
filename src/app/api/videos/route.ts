import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';
import { VideoSearchFilters } from '@/types/video';

const videoService = new VideoService();

/**
 * GET /api/videos - Get all videos or paginated videos with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if pagination is requested
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    
    // Build filters
    const filters: VideoSearchFilters = {};
    
    const category = searchParams.get('category');
    if (category && category !== 'all') {
      filters.category = category as VideoSearchFilters['category'];
    }
    
    const searchTerm = searchParams.get('searchTerm');
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }
    
    const tags = searchParams.get('tags');
    if (tags) {
      filters.tags = tags.split(',').filter(Boolean);
    }
    
    const isPublic = searchParams.get('isPublic');
    if (isPublic !== null) {
      filters.isPublic = isPublic === 'true';
    }
    
    // Return paginated or all videos
    if (page && limit) {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const result = await videoService.getPaginatedVideos(pageNum, limitNum, filters);
      return NextResponse.json(result);
    } else {
      const videos = await videoService.getAllVideos(filters);
      return NextResponse.json(videos);
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
