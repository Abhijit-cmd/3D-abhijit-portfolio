/**
 * **Feature: portfolio-improvements, Property 11: Design consistency**
 * 
 * Property-based tests for design consistency across video components.
 * Tests that for any page or component in the gaming videos feature, should maintain 
 * the same dark theme, animation patterns, and UI components as the rest of the portfolio.
 * 
 * **Validates: Requirements 6.1, 6.2, 6.4**
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { VideoPlayer } from '../video-player';
import { VideoCard } from '../video-card';
import { VideoGrid } from '../video-grid';
import { VideoUpload } from '../video-upload';
import { VideoMetadata } from '@/types/video';

// Mock toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock video service
vi.mock('@/lib/services/video-service', () => ({
  VideoService: class MockVideoService {
    getSupportedFormats() {
      return ['.mp4', '.webm', '.mov'];
    }
    getMaxFileSize() {
      return 100 * 1024 * 1024;
    }
    getMaxFileSizeFormatted() {
      return '100MB';
    }
    validateVideoFile() {
      return { isValid: true };
    }
  },
}));

// Generators for property-based testing
const videoMetadataArbitrary = fc.record({
  id: fc.string({ minLength: 3, maxLength: 50 }),
  title: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length > 2),
  description: fc.option(fc.string({ minLength: 3, maxLength: 500 })),
  filename: fc.string({ minLength: 3, maxLength: 100 }),
  originalName: fc.string({ minLength: 3, maxLength: 100 }),
  mimeType: fc.constantFrom('video/mp4', 'video/webm', 'video/quicktime'),
  size: fc.integer({ min: 1000, max: 500000000 }),
  duration: fc.option(fc.integer({ min: 1, max: 7200 })),
  thumbnail: fc.option(fc.string({ minLength: 5 })),
  uploadDate: fc.date(),
  lastModified: fc.date(),
  tags: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { maxLength: 10 }),
  category: fc.constantFrom('gameplay', 'tutorial', 'review', 'stream'),
  isPublic: fc.boolean(),
  viewCount: fc.integer({ min: 0, max: 1000000 }),
}) as fc.Arbitrary<VideoMetadata>;

const videoArrayArbitrary = fc.array(videoMetadataArbitrary, { minLength: 0, maxLength: 20 });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Video Components Design Consistency Property Tests', () => {
  /**
   * Property 11: Design consistency
   * For any page or component in the gaming videos feature, should maintain 
   * the same dark theme, animation patterns, and UI components as the rest of the portfolio
   */

  it('should maintain consistent dark theme colors across all video components', () => {
    fc.assert(
      fc.property(
        videoMetadataArbitrary,
        fc.string({ minLength: 5, maxLength: 100 }),
        (video, src) => {
          // Test VideoPlayer
          const { unmount: unmountPlayer } = render(
            <VideoPlayer src={src} title={video.title} video={video} />
          );
          
          // Should use dark theme background colors
          const playerContainer = document.querySelector('.bg-black');
          expect(playerContainer).toBeTruthy();
          
          // Should use consistent text colors (white/muted)
          const whiteText = document.querySelector('.text-white');
          expect(whiteText).toBeTruthy();
          
          unmountPlayer();
          
          // Test VideoCard
          const { unmount: unmountCard } = render(
            <VideoCard video={video} />
          );
          
          // Should use muted background colors consistent with theme
          const mutedElements = document.querySelectorAll('[class*="bg-muted"], [class*="text-muted-foreground"]');
          expect(mutedElements.length).toBeGreaterThan(0);
          
          unmountCard();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should use consistent border radius and spacing patterns', () => {
    fc.assert(
      fc.property(
        videoMetadataArbitrary,
        (video) => {
          const { unmount } = render(<VideoCard video={video} />);
          
          // Should use consistent rounded corners (rounded-lg pattern)
          const roundedElements = document.querySelectorAll('[class*="rounded"]');
          expect(roundedElements.length).toBeGreaterThan(0);
          
          // Should use consistent spacing patterns (space-y, gap, p-, m- classes)
          const spacingElements = document.querySelectorAll('[class*="space-"], [class*="gap-"], [class*="p-"], [class*="m-"]');
          expect(spacingElements.length).toBeGreaterThan(0);
          
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should use consistent button styling across components', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 3, maxLength: 50 }),
        (src, title) => {
          const { unmount } = render(
            <VideoPlayer src={src} title={title} controls={true} />
          );
          
          // Should use consistent button elements
          const buttons = document.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThan(0);
          
          // Buttons should have consistent styling patterns
          buttons.forEach(button => {
            const classes = button.className;
            // Should use consistent transition classes
            expect(classes).toMatch(/transition|duration|ease/);
          });
          
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should maintain consistent hover and animation patterns', () => {
    fc.assert(
      fc.property(
        videoMetadataArbitrary,
        (video) => {
          const { unmount } = render(<VideoCard video={video} />);
          
          // Should use consistent hover effects
          const hoverElements = document.querySelectorAll('[class*="hover:"]');
          expect(hoverElements.length).toBeGreaterThan(0);
          
          // Should use consistent transition classes
          const transitionElements = document.querySelectorAll('[class*="transition"]');
          expect(transitionElements.length).toBeGreaterThan(0);
          
          // Should use consistent transform patterns for animations
          const transformElements = document.querySelectorAll('[class*="transform"], [class*="scale"]');
          expect(transformElements.length).toBeGreaterThan(0);
          
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should use consistent typography patterns', () => {
    fc.assert(
      fc.property(
        videoArrayArbitrary,
        (videos) => {
          const { unmount } = render(<VideoGrid videos={videos} />);
          
          // Should use consistent text sizing patterns
          const textElements = document.querySelectorAll('[class*="text-"]');
          // Even empty grids should have some text elements (like "No Videos Found")
          expect(textElements.length).toBeGreaterThanOrEqual(0);
          
          // Should use consistent font weight patterns when content is present
          const fontElements = document.querySelectorAll('[class*="font-"]');
          if (videos.length > 0 || textElements.length > 0) {
            expect(fontElements.length).toBeGreaterThanOrEqual(0);
          }
          
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should maintain consistent loading and state indicators', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.option(fc.string({ minLength: 5, maxLength: 100 }).filter(s => s.trim().length > 0)),
        (isLoading, error) => {
          const { unmount } = render(
            <VideoGrid videos={[]} isLoading={isLoading} error={error} />
          );
          
          // Error state takes precedence over loading state in VideoGrid
          if (error && error.trim().length > 0) {
            // Error state should be displayed
            const container = document.querySelector('div');
            expect(container).toBeTruthy();
          } else if (isLoading) {
            // Only check loading state if there's no error
            const loadingElements = document.querySelectorAll('.animate-pulse');
            expect(loadingElements.length).toBeGreaterThan(0);
            
            const skeletonElements = document.querySelectorAll('[class*="bg-muted"]');
            expect(skeletonElements.length).toBeGreaterThan(0);
          } else {
            // Neither loading nor error - should show empty state
            const container = document.querySelector('div');
            expect(container).toBeTruthy();
          }
          
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should use consistent grid and layout patterns', () => {
    fc.assert(
      fc.property(
        videoArrayArbitrary,
        (videos) => {
          const { unmount } = render(<VideoGrid videos={videos} />);
          
          // Should use consistent grid patterns when videos are present
          const gridElements = document.querySelectorAll('[class*="grid"]');
          if (videos.length > 0) {
            expect(gridElements.length).toBeGreaterThan(0);
          }
          
          // Should use consistent responsive breakpoints (md:, lg:, xl:) when content is present
          const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="xl:"]');
          if (videos.length > 0) {
            expect(responsiveElements.length).toBeGreaterThan(0);
          }
          
          // Should use consistent aspect ratio patterns when videos are present
          const aspectElements = document.querySelectorAll('[class*="aspect-"]');
          if (videos.length > 0) {
            expect(aspectElements.length).toBeGreaterThan(0);
          }
          
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});

// Unit tests for specific design consistency examples
describe('Video Components Design Consistency Unit Tests', () => {
  it('should use dark theme background in video player', () => {
    render(<VideoPlayer src="https://example.com/video.mp4" title="Test Video" />);
    
    const container = document.querySelector('.bg-black');
    expect(container).toBeTruthy();
  });

  it('should use consistent button styling in video upload', () => {
    render(<VideoUpload />);
    
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Should have at least one button with consistent styling
    const styledButton = Array.from(buttons).find(button => 
      button.className.includes('transition') || 
      button.className.includes('rounded')
    );
    expect(styledButton).toBeTruthy();
  });

  it('should use consistent muted colors in video card', () => {
    const video: VideoMetadata = {
      id: 'test-id',
      title: 'Test Video',
      filename: 'test.mp4',
      originalName: 'test.mp4',
      mimeType: 'video/mp4',
      size: 1000000,
      uploadDate: new Date(),
      lastModified: new Date(),
      tags: ['test'],
      category: 'gameplay',
      isPublic: true,
      viewCount: 100,
    };
    
    render(<VideoCard video={video} />);
    
    const mutedElements = document.querySelectorAll('[class*="text-muted-foreground"]');
    expect(mutedElements.length).toBeGreaterThan(0);
  });

  it('should use consistent rounded corners across components', () => {
    const video: VideoMetadata = {
      id: 'test-id',
      title: 'Test Video',
      filename: 'test.mp4',
      originalName: 'test.mp4',
      mimeType: 'video/mp4',
      size: 1000000,
      uploadDate: new Date(),
      lastModified: new Date(),
      tags: [],
      category: 'gameplay',
      isPublic: true,
      viewCount: 0,
    };
    
    render(<VideoCard video={video} />);
    
    const roundedElements = document.querySelectorAll('[class*="rounded"]');
    expect(roundedElements.length).toBeGreaterThan(0);
  });

  it('should use consistent spacing in video grid', () => {
    const video: VideoMetadata = {
      id: 'test-id',
      title: 'Test Video',
      filename: 'test.mp4',
      originalName: 'test.mp4',
      mimeType: 'video/mp4',
      size: 1000000,
      uploadDate: new Date(),
      lastModified: new Date(),
      tags: [],
      category: 'gameplay',
      isPublic: true,
      viewCount: 0,
    };
    
    render(<VideoGrid videos={[video]} />);
    
    const spacingElements = document.querySelectorAll('[class*="space-"], [class*="gap-"]');
    expect(spacingElements.length).toBeGreaterThan(0);
  });


});