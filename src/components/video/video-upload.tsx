"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { VideoMetadata, VideoUploadRequest, UploadProgress } from '@/types/video';
import { VideoService } from '@/lib/services/video-service';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  onUploadComplete?: (video: VideoMetadata) => void;
  onUploadStart?: () => void;
  className?: string;
}

export function VideoUpload({ onUploadComplete, onUploadStart, className }: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState<VideoUploadRequest>({
    title: '',
    description: '',
    category: 'gameplay',
    tags: [],
    isPublic: true,
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoService = new VideoService();
  const { toast } = useToast();

  // Supported formats and max file size
  const supportedFormats = videoService.getSupportedFormats();
  const maxFileSize = videoService.getMaxFileSize();
  const maxFileSizeFormatted = videoService.getMaxFileSizeFormatted();

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    return videoService.validateVideoFile(file);
  }, [videoService]);

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-populate title if empty
    if (!formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }
  }, [validateFile, formData.title, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFormChange = useCallback((field: keyof VideoUploadRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTagAdd = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleTagRemove = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleTagInputKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  }, [handleTagAdd]);

  const simulateUploadProgress = useCallback((fileId: string, filename: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'processing' } : null);
      } else {
        setUploadProgress(prev => prev ? { ...prev, progress: Math.min(progress, 95) } : null);
      }
    }, 200);
    
    return interval;
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your video.",
        variant: "destructive",
      });
      return;
    }

    try {
      onUploadStart?.();
      
      const fileId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setUploadProgress({
        fileId,
        filename: selectedFile.name,
        progress: 0,
        status: 'uploading',
      });

      // Simulate upload progress
      const progressInterval = simulateUploadProgress(fileId, selectedFile.name);

      try {
        // Prepare form data for API
        const apiFormData = new FormData();
        apiFormData.append('file', selectedFile);
        apiFormData.append('title', formData.title);
        if (formData.description) {
          apiFormData.append('description', formData.description);
        }
        apiFormData.append('category', formData.category);
        apiFormData.append('tags', formData.tags.join(','));
        apiFormData.append('isPublic', formData.isPublic.toString());

        // Perform the actual upload via API
        const response = await fetch('/api/videos/upload', {
          method: 'POST',
          body: apiFormData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        clearInterval(progressInterval);
        
        setUploadProgress(prev => prev ? { ...prev, progress: 100, status: 'complete' } : null);

        toast({
          title: "Upload Successful",
          description: `"${result.video.title}" has been uploaded successfully.`,
        });

        // Reset form
        setSelectedFile(null);
        setFormData({
          title: '',
          description: '',
          category: 'gameplay',
          tags: [],
          isPublic: true,
        });
        setTagInput('');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Clear progress after a delay
        setTimeout(() => {
          setUploadProgress(null);
        }, 2000);

        onUploadComplete?.(result.video);

      } catch (error) {
        clearInterval(progressInterval);
        
        setUploadProgress(prev => prev ? { 
          ...prev, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : null);

        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : 'Failed to start upload.',
        variant: "destructive",
      });
    }
  }, [selectedFile, formData, onUploadStart, onUploadComplete, simulateUploadProgress, toast]);

  const isUploading = uploadProgress?.status === 'uploading' || uploadProgress?.status === 'processing';

  return (
    <div className={cn("space-y-6", className)}>
      {/* File Upload Area */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Video File</Label>
        
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-border",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <svg
                  className="w-8 h-8 text-primary"
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
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isUploading}
              >
                Remove File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium mb-2">Drag and drop your video file here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: MP4, WebM, MOV, AVI (Max size: {maxFileSizeFormatted})
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Choose File
                </Button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {uploadProgress.status === 'uploading' && 'Uploading...'}
              {uploadProgress.status === 'processing' && 'Processing...'}
              {uploadProgress.status === 'complete' && 'Upload Complete!'}
              {uploadProgress.status === 'error' && 'Upload Failed'}
            </Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(uploadProgress.progress)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                uploadProgress.status === 'error' ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
          {uploadProgress.error && (
            <p className="text-sm text-destructive">{uploadProgress.error}</p>
          )}
        </div>
      )}

      {/* Video Metadata Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
            placeholder="Enter video title..."
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="Describe your video..."
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleFormChange('category', e.target.value as VideoMetadata['category'])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isUploading}
          >
            <option value="gameplay">Gameplay</option>
            <option value="tutorial">Tutorial</option>
            <option value="review">Review</option>
            <option value="stream">Stream</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Add tags..."
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleTagAdd}
              disabled={!tagInput.trim() || isUploading}
            >
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="hover:text-destructive"
                    disabled={isUploading}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => handleFormChange('isPublic', e.target.checked)}
            className="rounded border-input"
            disabled={isUploading}
          />
          <Label htmlFor="isPublic" className="text-sm">
            Make this video public
          </Label>
        </div>
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || !formData.title.trim() || isUploading}
        className="w-full"
        size="lg"
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {uploadProgress?.status === 'processing' ? 'Processing...' : 'Uploading...'}
          </>
        ) : (
          'Upload Video'
        )}
      </Button>
    </div>
  );
}