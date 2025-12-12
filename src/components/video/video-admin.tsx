"use client";

import React, { useState, useEffect } from 'react';
import { VideoMetadata, VideoSearchFilters, VideoUpdateRequest } from '@/types/video';
<<<<<<< HEAD
import { VideoClientService } from '@/lib/services/video-client-service';
=======
import { VideoService } from '@/lib/services/video-service';
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { VideoEditModal } from './video-edit-modal';
import { VideoDeleteConfirmation } from './video-delete-confirmation';
import { VideoStatsCard } from './video-stats-card';
import Link from 'next/link';

export function VideoAdmin() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [editingVideo, setEditingVideo] = useState<VideoMetadata | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoMetadata | null>(null);
  const [stats, setStats] = useState<any>(null);

<<<<<<< HEAD
  const videoService = new VideoClientService();
=======
  const videoService = new VideoService();
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: VideoSearchFilters = {
        ...(selectedCategory !== 'all' && { category: selectedCategory as VideoMetadata['category'] }),
        ...(selectedVisibility === 'public' && { isPublic: true }),
        ...(selectedVisibility === 'private' && { isPublic: false }),
        ...(searchTerm && { searchTerm }),
      };

      const allVideos = await videoService.getAllVideos(filters);
      setVideos(allVideos);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const videoStats = await videoService.getVideoStats();
      setStats(videoStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadVideos();
    loadStats();
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVideos();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedVisibility]);

  const handleEditVideo = async (videoId: string, updates: VideoUpdateRequest) => {
    try {
      const updatedVideo = await videoService.updateVideo(videoId, updates);
      if (updatedVideo) {
        setVideos(prev => prev.map(v => v.id === videoId ? updatedVideo : v));
        setEditingVideo(null);
        await loadStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Failed to update video:', err);
      throw err;
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const success = await videoService.deleteVideo(videoId);
      if (success) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
        setDeletingVideo(null);
        await loadStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
      throw err;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedVisibility('all');
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      {stats && <VideoStatsCard stats={stats} />}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <Link href="/gaming-videos">
            <Button variant="ghost" className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Videos
            </Button>
          </Link>
          <Link href="/gaming-videos/upload">
            <Button variant="outline" className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New Video
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search videos by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40 justify-between">
                    {selectedCategory === 'all' ? 'All Categories' : 
                     selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory('gameplay')}>
                    Gameplay
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory('tutorial')}>
                    Tutorial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory('review')}>
                    Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedCategory('stream')}>
                    Stream
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-32 justify-between">
                    {selectedVisibility === 'all' ? 'All' : 
                     selectedVisibility.charAt(0).toUpperCase() + selectedVisibility.slice(1)}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-32">
                  <DropdownMenuItem onClick={() => setSelectedVisibility('all')}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedVisibility('public')}>
                    Public
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedVisibility('private')}>
                    Private
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(searchTerm || selectedCategory !== 'all' || selectedVisibility !== 'all') && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="whitespace-nowrap"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={loadVideos}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Videos List */}
      {videos.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedVisibility !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Upload your first gaming video to get started.'
                }
              </p>
              {(!searchTerm && selectedCategory === 'all' && selectedVisibility === 'all') && (
                <Link href="/gaming-videos/upload">
                  <Button>Upload Video</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Video Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{video.title}</h3>
                        {video.description && (
                          <p className="text-muted-foreground line-clamp-2">{video.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant={video.isPublic ? "default" : "secondary"}>
                          {video.isPublic ? "Public" : "Private"}
                        </Badge>
                        <Badge variant="outline">
                          {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Tags */}
                    {video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Uploaded:</span>
                        <br />
                        {formatDate(video.uploadDate)}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span>
                        <br />
                        {formatFileSize(video.size)}
                      </div>
                      <div>
                        <span className="font-medium">Views:</span>
                        <br />
                        {video.viewCount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Format:</span>
                        <br />
                        {video.mimeType.split('/')[1].toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingVideo(video)}
                      className="flex-1 lg:flex-none"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingVideo(video)}
                      className="flex-1 lg:flex-none text-destructive hover:text-destructive"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingVideo && (
        <VideoEditModal
          video={editingVideo}
          onSave={handleEditVideo}
          onCancel={() => setEditingVideo(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingVideo && (
        <VideoDeleteConfirmation
          video={deletingVideo}
          onConfirm={handleDeleteVideo}
          onCancel={() => setDeletingVideo(null)}
        />
      )}
    </div>
  );
}