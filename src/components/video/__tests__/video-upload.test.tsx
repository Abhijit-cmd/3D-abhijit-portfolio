import { describe, it, expect } from 'vitest';
import { VideoService } from '@/lib/services/video-service';

describe('VideoUpload Component Tests', () => {
  it('can import VideoUpload component', async () => {
    const { VideoUpload } = await import('../video-upload');
    expect(VideoUpload).toBeDefined();
    expect(typeof VideoUpload).toBe('function');
  });

  it('VideoService validates files correctly', () => {
    const videoService = new VideoService();
    
    // Test valid MP4 file
    const validFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB
    
    const validation = videoService.validateVideoFile(validFile);
    expect(validation.isValid).toBe(true);
  });

  it('VideoService rejects invalid file formats', () => {
    const videoService = new VideoService();
    
    // Test invalid file format
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(invalidFile, 'size', { value: 1024 }); // 1KB
    
    const validation = videoService.validateVideoFile(invalidFile);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('Invalid video format');
  });

  it('VideoService rejects files exceeding size limit', () => {
    const videoService = new VideoService();
    
    // Test file exceeding size limit
    const largeFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    Object.defineProperty(largeFile, 'size', { value: 600 * 1024 * 1024 }); // 600MB
    
    const validation = videoService.validateVideoFile(largeFile);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('File size exceeds maximum limit');
  });

  it('VideoService returns correct supported formats', () => {
    const videoService = new VideoService();
    const formats = videoService.getSupportedFormats();
    
    expect(formats).toContain('video/mp4');
    expect(formats).toContain('video/webm');
    expect(formats).toContain('video/quicktime');
    expect(formats).toContain('video/x-msvideo');
  });

  it('VideoService returns correct max file size', () => {
    const videoService = new VideoService();
    const maxSize = videoService.getMaxFileSize();
    const maxSizeFormatted = videoService.getMaxFileSizeFormatted();
    
    expect(maxSize).toBe(500 * 1024 * 1024);
    expect(maxSizeFormatted).toBe('500MB');
  });
});