<<<<<<< HEAD
'use client';

=======
import { Metadata } from "next";
import { config } from "@/data/config";
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoUpload } from "@/components/video/video-upload";

<<<<<<< HEAD
=======
export const metadata: Metadata = {
  title: `Upload Gaming Video | ${config.author}`,
  description: "Upload your gaming videos and content",
  openGraph: {
    title: `Upload Gaming Video | ${config.author}`,
    description: "Upload your gaming videos and content",
    url: `${config.site}/gaming-videos/upload`,
    type: "website",
  },
};

>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
export default function UploadPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
<<<<<<< HEAD
              Upload to COPEZONE
=======
              Upload Gaming Video
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share your gaming content with the world. Upload your gameplay videos, tutorials, and more.
            </p>
          </div>

          {/* Navigation Back */}
          <div className="mb-8">
            <Link href="/gaming-videos">
              <Button variant="ghost" className="gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
<<<<<<< HEAD
                Back to COPEZONE
=======
                Back to Gaming Videos
>>>>>>> 5e8de245757cd94140709dcc1c105d91c3469509
              </Button>
            </Link>
          </div>

          {/* Upload Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            <VideoUpload
              onUploadComplete={(video) => {
                console.log('Video uploaded successfully:', video);
                // Could redirect to the gaming videos page or show success message
              }}
              onUploadStart={() => {
                console.log('Upload started');
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}