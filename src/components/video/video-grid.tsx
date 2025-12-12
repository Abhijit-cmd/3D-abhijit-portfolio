"use client";

import React, { useState, useEffect } from 'react';
import { VideoMetadata, PaginatedVideoResponse } from '@/types/video';
import { VideoCard } from './video-card';
import { VideoModal } from './video-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoGridProps {
  videos?: VideoMetadata[];
  isLoading?: boolean;
  error?: string;
  onVideoSelect?: (video: VideoMetadata) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
  showPagination?: boolean;
  paginationData?: PaginatedVideoResponse;
  onPageChange?: (page: number) => void;
}

export function VideoGrid({
  videos = [],
  isLoading = false,
  error,
  onVideoSelect,
  onLoadMore,
  hasMore = false,
  className,
  showPagination = false,
  paginationData,
  onPageChange,
}: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoSelect = (video: VideoMetadata) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    onVideoSelect?.(video);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleNextVideo = () => {
    if (!selectedVideo) return;
    
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videos[nextIndex];
    
    if (nextVideo) {
      setSelectedVideo(nextVideo);
    }
  };

  const handlePreviousVideo = () => {
    if (!selectedVideo) return;
    
    const currentIndex = videos.findIndex(v => v.id === selectedVideo.id);
    const prevIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1;
    const prevVideo = videos[prevIndex];
    
    if (prevVideo) {
      setSelectedVideo(prevVideo);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case 'Escape':
          handleCloseModal();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousVideo();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextVideo();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedVideo, videos]);

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Videos</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (isLoading && videos.length === 0) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-video bg-muted/20 rounded-lg mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-muted/20 rounded w-3/4" />
              <div className="h-3 bg-muted/20 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0 && !isLoading) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Videos Found</h3>
        <p className="text-muted-foreground">
          No videos have been uploaded yet. Check back later for new content!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={() => handleVideoSelect(video)}
          />
        ))}
        
        {/* Loading placeholders for infinite scroll */}
        {isLoading && videos.length > 0 && (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`loading-${index}`} className="animate-pulse">
                <div className="aspect-video bg-muted/20 rounded-lg mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted/20 rounded w-3/4" />
                  <div className="h-3 bg-muted/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Load More Button */}
      {!showPagination && hasMore && !isLoading && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            size="lg"
            className="min-w-32"
          >
            Load More Videos
          </Button>
        </div>
      )}

      {/* Pagination */}
      {showPagination && paginationData && onPageChange && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            onClick={() => onPageChange(paginationData.currentPage - 1)}
            disabled={!paginationData.hasPreviousPage}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
              const page = i + 1;
              const isCurrentPage = page === paginationData.currentPage;
              
              return (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            onClick={() => onPageChange(paginationData.currentPage + 1)}
            disabled={!paginationData.hasNextPage}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onNext={videos.length > 1 ? handleNextVideo : undefined}
          onPrevious={videos.length > 1 ? handlePreviousVideo : undefined}
        />
      )}
    </div>
  );
}