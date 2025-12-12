import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';
import { VideoUploadRequest } from '@/types/video';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract file
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Extract metadata
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as VideoUploadRequest['category'];
    const tagsString = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Parse tags
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const uploadRequest: VideoUploadRequest = {
      title,
      description: description || undefined,
      category: category || 'gameplay',
      tags,
      isPublic,
    };

    // Initialize video service and upload
    const videoService = new VideoService();
    
    // Validate file
    const validation = videoService.validateVideoFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload video
    const uploadedVideo = await videoService.uploadVideo(
      file,
      uploadRequest,
      file.name,
      file.type
    );

    return NextResponse.json({
      success: true,
      video: uploadedVideo,
    });

  } catch (error) {
    console.error('Video upload API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Upload failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Configure maximum file size for the API route
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for uploads