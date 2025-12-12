import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';
import { FileStorageService } from '@/lib/storage/file-storage';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    const videoService = new VideoService();
    const fileStorage = new FileStorageService();

    // Get video metadata
    const video = await videoService.getVideoById(videoId);
    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }

    // Get video file path
    const videoPath = fileStorage.getVideoFilePath(video.filename);
    
    // Check if file exists
    try {
      await fs.access(videoPath);
    } catch {
      return new NextResponse('Video file not found', { status: 404 });
    }

    // Get file stats for range requests
    const stats = await fs.stat(videoPath);
    const fileSize = stats.size;

    // Handle range requests for video streaming
    const range = request.headers.get('range');
    
    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      // Read the requested chunk
      const fileHandle = await fs.open(videoPath, 'r');
      const buffer = Buffer.alloc(chunkSize);
      await fileHandle.read(buffer, 0, chunkSize, start);
      await fileHandle.close();

      // Return partial content
      return new NextResponse(buffer, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': video.mimeType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      // Return entire file
      const buffer = await fs.readFile(videoPath);
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': video.mimeType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}