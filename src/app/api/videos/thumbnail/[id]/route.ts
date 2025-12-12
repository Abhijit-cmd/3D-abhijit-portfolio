import { NextRequest, NextResponse } from 'next/server';
import { VideoService } from '@/lib/services/video-service';
import { FileStorageService } from '@/lib/storage/file-storage';
import fs from 'fs/promises';

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

    // Try to get existing thumbnail
    if (video.thumbnail) {
      try {
        const thumbnailPath = fileStorage.getThumbnailFilePath(video.thumbnail);
        const buffer = await fs.readFile(thumbnailPath);
        
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          },
        });
      } catch (error) {
        console.error('Error reading thumbnail file:', error);
      }
    }

    // Generate a placeholder thumbnail if no thumbnail exists
    const placeholderSvg = `
      <svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="180" fill="#1a1a1a"/>
        <g transform="translate(160, 90)">
          <circle cx="0" cy="0" r="30" fill="#333" opacity="0.8"/>
          <polygon points="-12,-8 -12,8 12,0" fill="#666"/>
        </g>
        <text x="160" y="140" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="12">
          ${video.title.length > 30 ? video.title.substring(0, 30) + '...' : video.title}
        </text>
        <text x="160" y="155" text-anchor="middle" fill="#555" font-family="Arial, sans-serif" font-size="10">
          ${video.category.toUpperCase()}
        </text>
      </svg>
    `;

    return new NextResponse(placeholderSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    
    // Return a generic error placeholder
    const errorSvg = `
      <svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="180" fill="#1a1a1a"/>
        <g transform="translate(160, 90)">
          <circle cx="0" cy="0" r="30" fill="#333" opacity="0.8"/>
          <text x="0" y="5" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="20">?</text>
        </g>
        <text x="160" y="140" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="12">
          Thumbnail not available
        </text>
      </svg>
    `;

    return new NextResponse(errorSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  }
}