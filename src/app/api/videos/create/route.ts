import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';
import { VideoUploadRequest } from '@/types/video';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * This API route creates a video record in the database after the client
 * has uploaded the video file directly to Vercel Blob storage.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      description,
      category,
      tags,
      isPublic,
      videoUrl,
      thumbnailUrl,
      filename,
    } = body;

    // Validate required fields
    if (!title || !category || !videoUrl || !filename) {
      return NextResponse.json(
        { error: 'Title, category, videoUrl, and filename are required' },
        { status: 400 }
      );
    }

    // Create video metadata request
    const uploadRequest: VideoUploadRequest = {
      title,
      description: description || '',
      category,
      tags: tags || [],
      isPublic: isPublic !== false,
    };

    // Create video record in database
    const videoService = new VideoService();
    const videoMetadata = await videoService.createVideoFromUrls(
      uploadRequest,
      videoUrl,
      filename,
      thumbnailUrl
    );

    console.log('Video record created:', videoMetadata.id);
    return NextResponse.json(videoMetadata, { status: 201 });
  } catch (error) {
    console.error('Video creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create video record' },
      { status: 500 }
    );
  }
}
