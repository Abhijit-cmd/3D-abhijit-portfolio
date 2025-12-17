import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';
import { VideoUploadRequest } from '@/types/video';
import { StorageError } from '@/lib/services/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract video file
    const videoFile = formData.get('video') as File;
    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Extract thumbnail file (optional)
    const thumbnailFile = formData.get('thumbnail') as File | null;

    // Extract metadata
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tagsString = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') === 'true';

    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Parse tags
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

    // Create upload request
    const uploadRequest: VideoUploadRequest = {
      title,
      description: description || '',
      category: category as any,
      tags,
      isPublic,
    };

    // Upload video
    const videoService = new VideoService();
    const videoMetadata = await videoService.uploadVideo(
      videoFile,
      uploadRequest,
      thumbnailFile || undefined
    );

    return NextResponse.json(videoMetadata, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);

    // Handle storage errors
    if (error instanceof StorageError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
