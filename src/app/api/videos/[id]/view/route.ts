import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';

const videoService = new VideoService();

/**
 * POST /api/videos/[id]/view - Increment view count
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await videoService.incrementViewCount(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}
