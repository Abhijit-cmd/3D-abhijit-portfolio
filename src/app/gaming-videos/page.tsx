"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { config } from "@/data/config";
import { VideoGrid } from '@/components/video/video-grid';
import { VideoMetadata, VideoSearchFilters, PaginatedVideoResponse } from '@/types/video';
import { VideoClientService } from '@/lib/services/video-client-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function GamingVideosPage() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<PaginatedVideoResponse | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-viewed' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'infinite' | 'pagination'>('infinite');

  const videoService = useMemo(() => new VideoClientService(), []);

  // Load available tags for filtering
  const loadAvailableTags = useCallback(async () => {
    try {
      const allVideos = await videoService.getAllVideos({ isPublic: true });
      const tags = new Set<string>();
      allVideos.forEach(video => {
        video.tags.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags).sort());
    } catch (err) {
      console.error('Failed to load available tags:', err);
    }
  }, [videoService]);

  const loadVideos = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      setIsLoading(true);
      setError(undefined);

      const filters: VideoSearchFilters = {
        isPublic: true, // Only show public videos on the main page
        ...(selectedCategory !== 'all' && { category: selectedCategory as VideoMetadata['category'] }),
        ...(searchTerm && { searchTerm }),
        ...(selectedTags.length > 0 && { tags: selectedTags }),
      };

      const response = await videoService.getPaginatedVideos(page, 12, filters);
      
      // Apply client-side sorting for better performance
      const sortedVideos = sortVideos(response.videos, sortBy);
      const sortedResponse = { ...response, videos: sortedVideos };
      
      if (reset || page === 1) {
        setVideos(sortedResponse.videos);
      } else {
        setVideos(prev => [...prev, ...sortedResponse.videos]);
      }
      
      setPaginationData(sortedResponse);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [videoService, selectedCategory, searchTerm, selectedTags, sortBy]);

  // Sort videos based on selected criteria
  const sortVideos = (videosToSort: VideoMetadata[], sortCriteria: typeof sortBy): VideoMetadata[] => {
    return [...videosToSort].sort((a, b) => {
      switch (sortCriteria) {
        case 'newest':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'oldest':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'most-viewed':
          return b.viewCount - a.viewCount;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  // Initial load
  useEffect(() => {
    loadAvailableTags();
    loadVideos(1, true);
  }, [loadAvailableTags, loadVideos]);

  // Reload when filters change with debouncing for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVideos(1, true);
    }, searchTerm ? 300 : 0); // Debounce only search term

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedTags, sortBy, loadVideos]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && paginationData?.hasNextPage) {
      loadVideos(currentPage + 1, false);
    }
  }, [isLoading, paginationData?.hasNextPage, currentPage, loadVideos]);

  const handlePageChange = useCallback((page: number) => {
    loadVideos(page, true);
  }, [loadVideos]);

  const handleVideoSelect = useCallback(async (video: VideoMetadata) => {
    // Increment view count when video is selected
    try {
      await videoService.incrementViewCount(video.id);
      // Update local state to reflect the view count change
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, viewCount: v.viewCount + 1 } : v
      ));
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  }, [videoService]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setSortBy('newest');
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleTagRemove = useCallback((tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  }, []);

  // Performance optimization: memoize filtered tag options
  const filteredAvailableTags = useMemo(() => {
    return availableTags.filter(tag => !selectedTags.includes(tag));
  }, [availableTags, selectedTags]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              COPEZONE
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              A library of clips that prove I still have no idea what I'm doing.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <a href="/gaming-videos/upload">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Video
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <a href="/gaming-videos/admin">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </a>
              </Button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="space-y-4 mb-8">
            {/* Search and Primary Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search videos by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2">
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
                    <DropdownMenuItem onClick={() => setSelectedCategory('funny_moments')}>
                      Funny Moments
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most-viewed">Most Viewed</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={(value: typeof viewMode) => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infinite">Infinite Scroll</SelectItem>
                    <SelectItem value="pagination">Pagination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tag Filtering */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                {filteredAvailableTags.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Add Tag
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-48 overflow-y-auto">
                      {filteredAvailableTags.map(tag => (
                        <DropdownMenuItem key={tag} onClick={() => handleTagSelect(tag)}>
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 hover:text-destructive"
                        aria-label={`Remove ${tag} tag`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory !== 'all' || selectedTags.length > 0 || sortBy !== 'newest') && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="whitespace-nowrap"
                >
                  Clear All Filters
                </Button>
                <div className="text-sm text-muted-foreground">
                  {paginationData && `${paginationData.totalCount} video${paginationData.totalCount !== 1 ? 's' : ''} found`}
                </div>
              </div>
            )}
          </div>

          {/* Video Grid */}
          <VideoGrid
            videos={videos}
            isLoading={isLoading}
            error={error}
            onVideoSelect={handleVideoSelect}
            onLoadMore={viewMode === 'infinite' ? handleLoadMore : undefined}
            hasMore={paginationData?.hasNextPage || false}
            showPagination={viewMode === 'pagination'}
            paginationData={paginationData || undefined}
            onPageChange={viewMode === 'pagination' ? handlePageChange : undefined}
            className="mb-12"
          />

          {/* Admin Links */}
          <div className="text-center pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Because even noobs need a video library
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <a href="/gaming-videos/upload">
                  Upload Videos
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/gaming-videos/admin">
                  Admin Panel
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}