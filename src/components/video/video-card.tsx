"use client";

import React, { useState } from 'react';
import { VideoMetadata } from '@/types/video';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  video: VideoMetadata;
  onClick?: () => void;
  className?: string;
  showMetadata?: boolean;
}

export function VideoCard({
  video,
  onClick,
  className,
  showMetadata = true,
}: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
      case 'tutorial':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'review':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'stream':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const thumbnailUrl = video.thumbnail || '/api/videos/thumbnail/' + video.id;

  return (
    <div
      className={cn(
        "group cursor-pointer transition-all duration-300 ease-out",
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10",
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${video.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/20 mb-3">
        {/* Thumbnail Image */}
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              isHovered && "scale-105"
            )}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          /* Fallback when no thumbnail */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xs text-muted-foreground/70">No Preview</p>
            </div>
          </div>
        )}

        {/* Overlay with play button */}
        <div
          className={cn(
            "absolute inset-0 bg-black/0 flex items-center justify-center transition-all duration-300",
            isHovered && "bg-black/30"
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-all duration-300 transform",
              isHovered ? "scale-100 opacity-100" : "scale-75 opacity-0"
            )}
          >
            <svg
              className="w-6 h-6 text-black ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Category Badge */}
        <div className={cn(
          "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border",
          getCategoryColor(video.category)
        )}>
          {video.category}
        </div>

        {/* Public/Private Indicator */}
        {!video.isPublic && (
          <div className="absolute top-2 right-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-full text-xs font-medium">
            Private
          </div>
        )}
      </div>

      {/* Video Metadata */}
      {showMetadata && (
        <div className="space-y-2">
          {/* Title */}
          <h3 className={cn(
            "font-semibold text-sm leading-tight line-clamp-2 transition-colors duration-200",
            isHovered && "text-primary"
          )}>
            {video.title}
          </h3>

          {/* Description */}
          {video.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {video.description}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              {/* View Count */}
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{video.viewCount.toLocaleString()}</span>
              </span>

              {/* File Size */}
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>{formatFileSize(video.size)}</span>
              </span>
            </div>

            {/* Upload Date */}
            <span title={new Date(video.uploadDate).toLocaleDateString()}>
              {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
            </span>
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted/30 text-muted-foreground text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="px-2 py-1 bg-muted/30 text-muted-foreground text-xs rounded-full">
                  +{video.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}