"use client";

import React, { useEffect, useState } from 'react';
import { VideoMetadata } from '@/types/video';
import { VideoPlayer } from './video-player';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface VideoModalProps {
  video: VideoMetadata;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export function VideoModal({
  video,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  className,
}: VideoModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getCategoryColor = (category: VideoMetadata['category']): string => {
    switch (category) {
      case 'gameplay':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'funny_moments':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'ArrowLeft':
          if (onPrevious) {
            e.preventDefault();
            onPrevious();
          }
          break;
        case 'ArrowRight':
          if (onNext) {
            e.preventDefault();
            onNext();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onNext, onPrevious]);

  if (!isOpen) return null;

  // Use video URL directly (supports both local paths and Blob URLs)
  const videoUrl = video.filename;
  const thumbnailUrl = video.thumbnail || '/assets/default-video-thumbnail.jpg';

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
        isClosing && "animate-out fade-out duration-200",
        !isClosing && "animate-in fade-in duration-200",
        className
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      aria-describedby="video-modal-description"
    >
      <div
        className={cn(
          "relative w-full max-w-6xl max-h-[90vh] bg-background rounded-lg shadow-2xl overflow-hidden",
          isClosing && "animate-out zoom-out-95 duration-200",
          !isClosing && "animate-in zoom-in-95 duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              getCategoryColor(video.category)
            )}>
              {video.category === 'funny_moments' ? 'Funny Moments' : video.category.charAt(0).toUpperCase() + video.category.slice(1)}
            </div>
            {!video.isPublic && (
              <div className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-sm font-medium">
                Private
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Navigation Buttons */}
            {onPrevious && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Previous video"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
            )}
            
            {onNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Next video"
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close video modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Video Player */}
          <div className="flex-1">
            <VideoPlayer
              src={videoUrl}
              poster={thumbnailUrl}
              title={video.title}
              video={video}
              controls={true}
              className="w-full aspect-video lg:aspect-auto lg:h-[60vh]"
              onError={(error) => {
                console.error('Video playback error:', error);
              }}
            />
          </div>

          {/* Video Information Sidebar */}
          <div className="w-full lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-border bg-muted/20">
            <div className="space-y-6">
              {/* Title and Description */}
              <div>
                <h2 id="video-modal-title" className="text-xl font-bold mb-3 leading-tight">
                  {video.title}
                </h2>
                {video.description && (
                  <p id="video-modal-description" className="text-muted-foreground text-sm leading-relaxed">
                    {video.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Views</p>
                  <p className="font-semibold">{video.viewCount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Published</p>
                  <p className="font-semibold text-sm">
                    {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {video.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}