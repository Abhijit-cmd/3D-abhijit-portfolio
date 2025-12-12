"use client";

import React, { useState, useEffect } from 'react';
import { VideoMetadata, VideoUpdateRequest } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface VideoEditModalProps {
  video: VideoMetadata;
  onSave: (videoId: string, updates: VideoUpdateRequest) => Promise<void>;
  onCancel: () => void;
}

export function VideoEditModal({ video, onSave, onCancel }: VideoEditModalProps) {
  const [formData, setFormData] = useState<VideoUpdateRequest>({
    title: video.title,
    description: video.description || '',
    category: video.category,
    tags: video.tags,
    isPublic: video.isPublic,
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);
=======
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
<<<<<<< HEAD
      
      // If thumbnail is selected, upload it separately first
      if (selectedThumbnail) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('thumbnail', selectedThumbnail);
        
        const thumbnailResponse = await fetch(`/api/videos/${video.id}/thumbnail`, {
          method: 'POST',
          body: thumbnailFormData,
        });
        
        if (!thumbnailResponse.ok) {
          throw new Error('Failed to upload thumbnail');
        }
      }
      
      // Then update the video metadata
=======
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
      await onSave(video.id, formData);
    } catch (err) {
      console.error('Failed to update video:', err);
      setError('Failed to update video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

<<<<<<< HEAD
  const handleThumbnailSelect = (file: File) => {
    // Validate image format
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP image for thumbnail.');
      return;
    }

    // Validate file size (max 5MB for thumbnails)
    if (file.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be less than 5MB.');
      return;
    }

    setSelectedThumbnail(file);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleThumbnailSelect(files[0]);
    }
  };

=======
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter video description"
              rows={4}
            />
          </div>

<<<<<<< HEAD
          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <div className="flex items-start gap-4">
              {thumbnailPreview || video.thumbnail ? (
                <div className="relative w-40 h-22 rounded-lg overflow-hidden border-2 border-border">
                  <img 
                    src={thumbnailPreview || `/api/videos/thumbnail/${video.id}`} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  {thumbnailPreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => {
                        setSelectedThumbnail(null);
                        setThumbnailPreview(null);
                        if (thumbnailInputRef.current) {
                          thumbnailInputRef.current.value = '';
                        }
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-40 h-22 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {selectedThumbnail ? 'New thumbnail selected' : 'Update video thumbnail'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnailPreview ? 'Change Thumbnail' : 'Upload New Thumbnail'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP (Max 5MB)
                </p>
              </div>
            </div>

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleThumbnailInputChange}
              className="hidden"
            />
          </div>

=======
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                category: value as VideoMetadata['category'] 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gameplay">Gameplay</SelectItem>
<<<<<<< HEAD
                <SelectItem value="funny_moments">Funny Moments</SelectItem>
=======
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="stream">Stream</SelectItem>
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-3">
              {/* Existing Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Add New Tag */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="visibility">Public Video</Label>
              <p className="text-sm text-muted-foreground">
                Make this video visible to all visitors
              </p>
            </div>
            <Switch
              id="visibility"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            />
          </div>

          {/* Video Info (Read-only) */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Video Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">File:</span> {video.originalName}
              </div>
              <div>
                <span className="font-medium">Size:</span> {(video.size / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div>
                <span className="font-medium">Format:</span> {video.mimeType}
              </div>
              <div>
                <span className="font-medium">Views:</span> {video.viewCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title?.trim()}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}