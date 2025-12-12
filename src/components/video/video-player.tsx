"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VideoMetadata } from '@/types/video';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  video?: VideoMetadata;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
  onProgress?: (progress: number) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: string) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage?: string;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
}

export function VideoPlayer({
  src,
  poster,
  title,
  video,
  autoplay = false,
  controls = true,
  className,
  onProgress,
  onLoadStart,
  onLoadEnd,
  onError,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isLoading: false,
    isBuffering: false,
    hasError: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    showControls: true,
  });

  // Format time for display
  const formatTime = useCallback((time: number): string => {
    if (isNaN(time)) return '0:00';
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  // Handle play/pause toggle
  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: 'Failed to play video. Please try again.',
      }));
      onError?.('Failed to play video. Please try again.');
    }
  }, [state.isPlaying, onError]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    
    const volume = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = volume;
    setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  }, []);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !state.isMuted;
    videoRef.current.muted = newMuted;
    setState(prev => ({ ...prev, isMuted: newMuted }));
  }, [state.isMuted]);

  // Handle seek
  const handleSeek = useCallback((newTime: number) => {
    if (!videoRef.current || state.duration === 0) return;
    
    const time = Math.max(0, Math.min(state.duration, newTime));
    videoRef.current.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, [state.duration]);

  // Handle progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || state.duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * state.duration;
    
    handleSeek(newTime);
  }, [state.duration, handleSeek]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!state.isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [state.isFullscreen]);

  // Show/hide controls
  const showControlsTemporarily = useCallback(() => {
    setState(prev => ({ ...prev, showControls: true }));
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, showControls: false }));
    }, 3000);
  }, []);

  // Handle mouse movement over video
  const handleMouseMove = useCallback(() => {
    if (state.isPlaying) {
      showControlsTemporarily();
    }
  }, [state.isPlaying, showControlsTemporarily]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!videoRef.current) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleSeek(state.currentTime - 10);
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleSeek(state.currentTime + 10);
        break;
      case 'ArrowUp':
        e.preventDefault();
        handleVolumeChange(state.volume + 0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        handleVolumeChange(state.volume - 0.1);
        break;
      case 'KeyM':
        e.preventDefault();
        toggleMute();
        break;
      case 'KeyF':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  }, [togglePlayPause, handleSeek, state.currentTime, handleVolumeChange, state.volume, toggleMute, toggleFullscreen]);

  // Video event handlers
  const handleLoadStart = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, hasError: false }));
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setState(prev => ({ 
      ...prev, 
      duration: videoRef.current?.duration || 0,
      isLoading: false 
    }));
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    setState(prev => ({ ...prev, currentTime }));
    onProgress?.(currentTime);
  }, [onProgress]);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
    showControlsTemporarily();
    onPlay?.();
  }, [showControlsTemporarily, onPlay]);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, showControls: true }));
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, showControls: true }));
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const errorMessage = 'Failed to load video. Please check your connection and try again.';
    setState(prev => ({ 
      ...prev, 
      hasError: true, 
      errorMessage,
      isLoading: false,
      isBuffering: false 
    }));
    onError?.(errorMessage);
  }, [onError]);

  const handleWaiting = useCallback(() => {
    setState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setState(prev => ({ ...prev, isBuffering: false }));
  }, []);

  const handleVolumeChangeEvent = useCallback(() => {
    if (!videoRef.current) return;
    setState(prev => ({ 
      ...prev, 
      volume: videoRef.current?.volume || 0,
      isMuted: videoRef.current?.muted || false
    }));
  }, []);

  // Handle fullscreen change
  const handleFullscreenChange = useCallback(() => {
    const isFullscreen = !!document.fullscreenElement;
    setState(prev => ({ ...prev, isFullscreen }));
  }, []);

  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('volumechange', handleVolumeChangeEvent);

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('volumechange', handleVolumeChangeEvent);

      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [
    handleLoadStart,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleWaiting,
    handleCanPlay,
    handleVolumeChangeEvent,
    handleFullscreenChange,
    handleKeyDown,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        state.isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (state.isPlaying) {
          setState(prev => ({ ...prev, showControls: false }));
        }
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={autoplay} // Autoplay requires muted
        playsInline
        className="w-full h-full object-contain"
        onClick={togglePlayPause}
        aria-label={`Video player: ${title}`}
        title={title}
      />

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Buffering Overlay */}
      {state.isBuffering && !state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white text-xs">Buffering...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 mx-auto text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Video Error</h3>
              <p className="text-gray-300 text-sm mb-4">
                {state.errorMessage || 'An error occurred while loading the video.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setState(prev => ({ ...prev, hasError: false, errorMessage: undefined }));
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!state.isPlaying && !state.isLoading && !state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={togglePlayPause}
            aria-label="Play video"
          >
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </Button>
        </div>
      )}

      {/* Controls */}
      {controls && (state.showControls || !state.isPlaying) && !state.hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
              onClick={handleProgressClick}
              role="progressbar"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={state.duration}
              aria-valuenow={state.currentTime}
              aria-valuetext={`${formatTime(state.currentTime)} of ${formatTime(state.duration)}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  handleSeek(Math.max(0, state.currentTime - 10));
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  handleSeek(Math.min(state.duration, state.currentTime + 10));
                }
              }}
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={togglePlayPause}
                aria-label={state.isPlaying ? "Pause video" : "Play video"}
              >
                {state.isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </Button>

              {/* Volume Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                  aria-label={state.isMuted || state.volume === 0 ? "Unmute video" : "Mute video"}
                >
                  {state.isMuted || state.volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state.isMuted ? 0 : state.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  aria-label="Volume control"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={state.isMuted ? 0 : state.volume}
                  aria-valuetext={`Volume ${Math.round((state.isMuted ? 0 : state.volume) * 100)}%`}
                />
              </div>

              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Fullscreen Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
                aria-label={state.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {state.isFullscreen ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Title */}
      {title && (state.showControls || !state.isPlaying) && !state.hasError && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
          {video && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
              <span className="capitalize">{video.category}</span>
              <span>•</span>
              <span>{video.viewCount} views</span>
              {video.uploadDate && (
                <>
                  <span>•</span>
                  <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}