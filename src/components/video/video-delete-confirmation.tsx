"use client";

import React, { useState } from 'react';
import { VideoMetadata } from '@/types/video';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';

interface VideoDeleteConfirmationProps {
  video: VideoMetadata;
  onConfirm: (videoId: string) => Promise<void>;
  onCancel: () => void;
}

export function VideoDeleteConfirmation({ video, onConfirm, onCancel }: VideoDeleteConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(video.id);
    } catch (err) {
      console.error('Failed to delete video:', err);
      setError('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={() => !isDeleting && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Video</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this video? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-lg">{video.title}</h4>
            {video.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {video.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-2">
              <div>
                <span className="font-medium">File:</span> {video.originalName}
              </div>
              <div>
                <span className="font-medium">Size:</span> {formatFileSize(video.size)}
              </div>
              <div>
                <span className="font-medium">Category:</span> {video.category}
              </div>
              <div>
                <span className="font-medium">Views:</span> {video.viewCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-destructive mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• The video file from storage</li>
                  <li>• All video metadata and statistics</li>
                  <li>• Any associated thumbnails</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Video
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}