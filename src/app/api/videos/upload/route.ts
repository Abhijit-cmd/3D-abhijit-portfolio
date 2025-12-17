import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

// Configure route segment
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * This API route handles client-side upload requests to Vercel Blob.
 * It generates a signed upload URL that the client can use to upload directly to Blob storage.
 * 
 * This approach bypasses the 4.5MB body size limit for serverless functions.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate the upload request
        console.log('Generating upload token for:', pathname);
        
        // You can add custom validation here
        // For example, check user permissions, file type, etc.
        
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-msvideo',
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg',
          ],
          tokenPayload: JSON.stringify({
            // Optional: Add custom metadata
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs after the upload is complete
        console.log('Upload completed:', blob.url);
        
        // You can add post-upload logic here
        // For example, create database record, send notification, etc.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload token generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload token' },
      { status: 500 }
    );
  }
}
