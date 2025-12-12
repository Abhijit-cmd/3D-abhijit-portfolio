"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { VideoSearchFilters, VideoMetadata } from '@/types/video';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface VideoSearchProps {
  onFiltersChange: (filters: VideoSearchFilters) => void;
  onSortChange: (sort: 'newest' | 'oldest' | 'most-viewed' | 'title') => void;
  availableTags: string[];
  totalCount?: number;
  className?: string;
  initialFilters?: VideoSearchFilters;
  initialSort?: 'newest' | 'oldest' | 'most-viewed' | 'title';
}

export function VideoSearch({
  onFiltersChange,
  onSortChange,
  availableTags,
  totalCount,
  className,
  initialFilters = {},
  initialSort = 'newest'
}: VideoSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialFilters.category || 'all'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialFilters.tags || []
  );
  const [sortBy, setSortBy] = useState<typeof initialSort>(initialSort);

  // Debounced search term update
  const updateFilters = useCallback(() => {
    const filters: VideoSearchFilters = {
      ...(searchTerm && { searchTerm }),
      ...(selectedCategory !== 'all' && { 
        category: selectedCategory as VideoMetadata['category'] 
      }),
      ...(selectedTags.length > 0 && { tags: selectedTags }),
      isPublic: true, // Always filter for public videos on main page
    };
    onFiltersChange(filters);
  }, [searchTerm, selectedCategory, selectedTags, onFiltersChange]);

  // Update filters when values change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters();
    }, searchTerm ? 300 : 0); // Debounce search term only

    return () => clearTimeout(timeoutId);
  }, [updateFilters, searchTerm]);

  const handleSortChange = useCallback((value: typeof sortBy) => {
    setSortBy(value);
    onSortChange(value);
  }, [onSortChange]);

  const handleTagSelect = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      return newTags;
    });
  }, []);

  const handleTagRemove = useCallback((tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
    setSortBy('newest');
  }, []);

  // Performance optimization: memoize filtered tag options
  const filteredAvailableTags = useMemo(() => {
    return availableTags.filter(tag => !selectedTags.includes(tag));
  }, [availableTags, selectedTags]);

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || 
    selectedTags.length > 0 || sortBy !== 'newest';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Primary Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search videos by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            aria-label="Search videos"
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

          <Select value={sortBy} onValueChange={handleSortChange}>
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

      {/* Clear Filters and Results Count */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="whitespace-nowrap"
          >
            Clear All Filters
          </Button>
          {totalCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              {totalCount} video{totalCount !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}