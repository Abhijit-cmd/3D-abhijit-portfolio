import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { VideoService } from '@/lib/services/video-service';

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

    // Convert file to buffer
    const bytes = await thumbnail.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename
    const extension = thumbnail.name.split('.').pop() || 'jpg';
    const filename = `${videoId}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
    const filepath = path.join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Update video record with thumbnail path
    const videoService = new VideoService();
    const thumbnailPath = `/uploads/thumbnails/${filename}`;
    await videoService.updateVideo(videoId, { thumbnail: thumbnailPath });

    return NextResponse.json({
      success: true,
      thumbnailPath,
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
