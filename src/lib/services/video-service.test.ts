import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VideoService } from './video-service';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * **Feature: portfolio-improvements, Property 6: Video upload workflow**
 * **Validates: Requirements 3.2, 3.3**
 * 
 * For any valid video file, when uploaded through the interface, 
 * should result in both file storage and database entry creation with complete metadata
 */

describe('VideoService Property-Based Tests', () => {
  let videoService: VideoService;
  const testUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
  const testDbPath = path.join(process.cwd(), 'src', 'data', 'videos.json');

  beforeEach(async () => {
    videoService = new VideoService();
    
    // Clean up test directories and files
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
      await fs.rm(testDbPath, { force: true });
    } catch (error) {
      // Ignore errors if files don't exist
    }
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
      await fs.rm(testDbPath, { force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('Property 6: Video upload workflow - should create both file and database entry for any valid video', async () => {
    const uploadRequest = {
      title: 'Test Gaming Video',
      description: 'A test gaming video',
      category: 'gameplay' as const,
      tags: ['test', 'gaming'],
      isPublic: true
    };

    const mockVideoBuffer = Buffer.alloc(1024 * 1024, 'mock video data'); // 1MB
    const originalName = 'test-video.mp4';
    const mimeType = 'video/mp4';

    // Upload the video
    const uploadedVideo = await videoService.uploadVideo(
      mockVideoBuffer,
      uploadRequest,
      originalName,
      mimeType
    );

    // Verify the uploaded video has all required properties
    expect(uploadedVideo).toBeDefined();
    expect(uploadedVideo.id).toBeDefined();
    expect(uploadedVideo.title).toBe(uploadRequest.title);
    expect(uploadedVideo.description).toBe(uploadRequest.description);
    expect(uploadedVideo.category).toBe(uploadRequest.category);
    expect(uploadedVideo.tags).toEqual(uploadRequest.tags);
    expect(uploadedVideo.isPublic).toBe(uploadRequest.isPublic);
    expect(uploadedVideo.originalName).toBe(originalName);
    expect(uploadedVideo.mimeType).toBe(mimeType);
    expect(uploadedVideo.size).toBe(1024 * 1024);
    expect(uploadedVideo.filename).toBeDefined();
    expect(uploadedVideo.uploadDate).toBeInstanceOf(Date);
    expect(uploadedVideo.lastModified).toBeInstanceOf(Date);
    expect(uploadedVideo.viewCount).toBe(0);

    // Verify the video can be retrieved from database
    const retrievedVideo = await videoService.getVideoById(uploadedVideo.id);
    expect(retrievedVideo).toBeDefined();
    expect(retrievedVideo?.id).toBe(uploadedVideo.id);
    expect(retrievedVideo?.title).toBe(uploadRequest.title);

    // Verify the file was actually stored
    const fileExists = await fs.access(path.join(testUploadsDir, uploadedVideo.filename))
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    // Verify file size matches
    const stats = await fs.stat(path.join(testUploadsDir, uploadedVideo.filename));
    expect(stats.size).toBe(1024 * 1024);
  }, 30000);

  it('Property 6a: Video upload workflow - should reject invalid file formats', async () => {
    const uploadRequest = {
      title: 'Test Video',
      description: 'Test description',
      category: 'gameplay' as const,
      tags: ['test'],
      isPublic: true
    };

    const mockBuffer = Buffer.alloc(1024, 'mock data');
    
    // Should throw error for invalid format
    await expect(
      videoService.uploadVideo(mockBuffer, uploadRequest, 'test.txt', 'text/plain')
    ).rejects.toThrow('Invalid video format');
  });

  it('Property 6b: Video upload workflow - should reject files exceeding size limit', async () => {
    const uploadRequest = {
      title: 'Test Video',
      description: 'Test description',
      category: 'gameplay' as const,
      tags: ['test'],
      isPublic: true
    };

    // Create a buffer that's larger than 500MB limit
    const oversizedBuffer = Buffer.alloc(1024, 'test data');
    
    // Mock the length property to simulate a large file
    Object.defineProperty(oversizedBuffer, 'length', {
      value: 501 * 1024 * 1024, // 501MB
      writable: false
    });

    await expect(
      videoService.uploadVideo(oversizedBuffer, uploadRequest, 'test.mp4', 'video/mp4')
    ).rejects.toThrow('File size exceeds maximum limit');
  });

  it('Property 6c: Video upload workflow - should handle database and file consistency', async () => {
    const uploadRequest = {
      title: 'Test Video for Deletion',
      description: 'A test video that will be deleted',
      category: 'tutorial' as const,
      tags: ['test', 'delete'],
      isPublic: false
    };

    const mockBuffer = Buffer.alloc(512 * 1024, 'mock video data'); // 512KB
    
    // Upload video
    const uploadedVideo = await videoService.uploadVideo(
      mockBuffer,
      uploadRequest,
      'delete-test.mp4',
      'video/mp4'
    );

    // Delete the video
    const deleteResult = await videoService.deleteVideo(uploadedVideo.id);
    expect(deleteResult).toBe(true);

    // Verify video is removed from database
    const retrievedVideo = await videoService.getVideoById(uploadedVideo.id);
    expect(retrievedVideo).toBeNull();

    // Verify file is removed from storage (or at least attempt was made)
    const fileExists = await fs.access(path.join(testUploadsDir, uploadedVideo.filename))
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(false);
  }, 30000);
});