import { Prisma, Video, VideoCategory } from '@prisma/client';
import prisma from '@/lib/database/prisma';
import { VideoMetadata, VideoSearchFilters, PaginatedVideoResponse } from '@/types/video';

export class VideoRepository {
  /**
   * Create a new video record
   */
  async create(data: Omit<VideoMetadata, 'uploadDate' | 'lastModified' | 'viewCount'>): Promise<VideoMetadata> {
    const video = await prisma.video.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: BigInt(data.size),
        duration: data.duration,
        thumbnail: data.thumbnail,
        tags: data.tags,
        category: data.category as VideoCategory,
        isPublic: data.isPublic,
      },
    });

    return this.mapToVideoMetadata(video);
  }

  /**
   * Find video by ID
   */
  async findById(id: string): Promise<VideoMetadata | null> {
    const video = await prisma.video.findUnique({
      where: { id },
    });

    return video ? this.mapToVideoMetadata(video) : null;
  }

  /**
   * Update video
   */
  async update(id: string, data: Partial<VideoMetadata>): Promise<VideoMetadata | null> {
    try {
      const video = await prisma.video.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          tags: data.tags,
          category: data.category as VideoCategory | undefined,
          isPublic: data.isPublic,
          duration: data.duration,
          thumbnail: data.thumbnail,
        },
      });

      return this.mapToVideoMetadata(video);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  /**
   * Delete video
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.video.delete({
        where: { id },
      });
      return true;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Record not found
      }
      throw error;
    }
  }

  /**
   * Find all videos with filters
   */
  async findAll(filters?: VideoSearchFilters): Promise<VideoMetadata[]> {
    const where = this.buildWhereClause(filters);

    const videos = await prisma.video.findMany({
      where,
      orderBy: { uploadDate: 'desc' },
    });

    return videos.map(this.mapToVideoMetadata);
  }

  /**
   * Find paginated videos
   */
  async findPaginated(
    page: number = 1,
    limit: number = 12,
    filters?: VideoSearchFilters
  ): Promise<PaginatedVideoResponse> {
    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [videos, totalCount] = await prisma.$transaction([
      prisma.video.findMany({
        where,
        orderBy: { uploadDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      videos: videos.map(this.mapToVideoMetadata),
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await prisma.video.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get video statistics
   */
  async getStats(): Promise<{
    totalVideos: number;
    totalViews: number;
    categoryCounts: Record<string, number>;
    publicVideos: number;
    privateVideos: number;
  }> {
    const [totalVideos, totalViews, categoryGroups, publicCount, privateCount] = await prisma.$transaction([
      prisma.video.count(),
      prisma.video.aggregate({
        _sum: {
          viewCount: true,
        },
      }),
      prisma.video.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        orderBy: {
          category: 'asc',
        },
      }),
      prisma.video.count({ where: { isPublic: true } }),
      prisma.video.count({ where: { isPublic: false } }),
    ]);

    const categoryCounts: Record<string, number> = {};
    categoryGroups.forEach((group) => {
      categoryCounts[group.category] = group._count.category;
    });

    return {
      totalVideos,
      totalViews: Number(totalViews._sum.viewCount || 0),
      categoryCounts,
      publicVideos: publicCount,
      privateVideos: privateCount,
    };
  }

  /**
   * Build WHERE clause from filters
   */
  private buildWhereClause(filters?: VideoSearchFilters): Prisma.VideoWhereInput {
    if (!filters) return {};

    const where: Prisma.VideoWhereInput = {};

    if (filters.category) {
      where.category = filters.category as VideoCategory;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.searchTerm) {
      where.OR = [
        { title: { contains: filters.searchTerm, mode: 'insensitive' } },
        { description: { contains: filters.searchTerm, mode: 'insensitive' } },
        { tags: { hasSome: [filters.searchTerm] } },
      ];
    }

    return where;
  }

  /**
   * Map Prisma Video to VideoMetadata
   */
  private mapToVideoMetadata(video: Video): VideoMetadata {
    return {
      id: video.id,
      title: video.title,
      description: video.description || undefined,
      filename: video.filename,
      originalName: video.originalName,
      mimeType: video.mimeType,
      size: Number(video.size),
      duration: video.duration || undefined,
      thumbnail: video.thumbnail || undefined,
      uploadDate: video.uploadDate,
      lastModified: video.lastModified,
      tags: video.tags,
      category: video.category as VideoMetadata['category'],
      isPublic: video.isPublic,
      viewCount: video.viewCount,
    };
  }
}
