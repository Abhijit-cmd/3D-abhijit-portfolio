import { Metadata } from "next";
import { config } from "@/data/config";
import { VideoAdmin } from "@/components/video/video-admin";

export const metadata: Metadata = {
  title: `Video Admin | ${config.author}`,
  description: "Manage gaming videos and content",
  openGraph: {
    title: `Video Admin | ${config.author}`,
    description: "Manage gaming videos and content",
    url: `${config.site}/gaming-videos/admin`,
    type: "website",
  },
};

export default function VideoAdminPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Video Administration
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your gaming video library, edit metadata, and organize content.
            </p>
          </div>

          {/* Admin Interface */}
          <VideoAdmin />
        </div>
      </div>
    </main>
  );
}