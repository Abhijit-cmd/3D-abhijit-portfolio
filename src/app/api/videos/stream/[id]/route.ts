import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const videoService = new VideoService();

    // Get video metadata
    const video = await videoService.getVideoById(videoId);
    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }

    // Video streaming not supported on Vercel (read-only filesystem)
    // Would need to implement with Vercel Blob or similar cloud storage
    return new NextResponse('Video streaming not available in production', { status: 501 });
  } catch (error) {
    console.error('Error streaming video:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}