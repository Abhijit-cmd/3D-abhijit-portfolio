-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('gameplay', 'tutorial', 'review', 'stream');

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "duration" INTEGER,
    "thumbnail" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "category" "VideoCategory" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_filename_key" ON "videos"("filename");

-- CreateIndex
CREATE INDEX "videos_category_idx" ON "videos"("category");

-- CreateIndex
CREATE INDEX "videos_uploadDate_idx" ON "videos"("uploadDate");

-- CreateIndex
CREATE INDEX "videos_isPublic_idx" ON "videos"("isPublic");
