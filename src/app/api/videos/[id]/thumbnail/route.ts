import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';
import { createStorageService } from '@/lib/services/storage';
import { generateUniqueFilename } from '@/lib/utils/file-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const formData = await request.formData();
    const thumbnail = formData.get('thumbnail') as File;

    if (!thumbnail) {
      return NextResponse.json(
        { error: 'No thumbnail file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(thumbnail.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (thumbnail.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = generateUniqueFilename(thumbnail.name);

    // Upload thumbnail using storage service
    const storageService = createStorageService();
    const thumbnailUrl = await storageService.uploadThumbnail(thumbnail, filename);

    // Update video record with thumbnail URL
    const videoService = new VideoService();
    await videoService.updateVideo(videoId, { thumbnail: thumbnailUrl });

    return NextResponse.json({
      success: true,
      thumbnailUrl,
      message: 'Thumbnail uploaded successfully'
    });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload thumbnail' },
      { status: 500 }
    );
  }
}
