import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample videos...');

  // Create sample video records
  const video1 = await prisma.video.create({
    data: {
      id: 'sample-video-1',
      title: 'Epic Gaming Moment #1',
      description: 'An amazing gameplay highlight from my latest stream',
      filename: 'sample-1.mp4',
      originalName: 'epic-moment-1.mp4',
      mimeType: 'video/mp4',
      size: BigInt(15000000), // 15MB
      duration: 120, // 2 minutes
      thumbnail: 'https://via.placeholder.com/640x360/1a1a2e/16213e?text=Epic+Gaming+Moment',
      tags: ['gaming', 'highlight', 'epic'],
      category: 'gameplay',
      isPublic: true,
      viewCount: 42,
    },
  });

  const video2 = await prisma.video.create({
    data: {
      id: 'sample-video-2',
      title: 'Funny Fails Compilation',
      description: 'The funniest moments from this week',
      filename: 'sample-2.mp4',
      originalName: 'funny-fails.mp4',
      mimeType: 'video/mp4',
      size: BigInt(20000000), // 20MB
      duration: 180, // 3 minutes
      thumbnail: 'https://via.placeholder.com/640x360/1a1a2e/16213e?text=Funny+Fails',
      tags: ['funny', 'fails', 'compilation'],
      category: 'funny_moments',
      isPublic: true,
      viewCount: 128,
    },
  });

  const video3 = await prisma.video.create({
    data: {
      id: 'sample-video-3',
      title: 'Pro Gameplay Strategy',
      description: 'Advanced tactics and strategies for competitive play',
      filename: 'sample-3.mp4',
      originalName: 'pro-strategy.mp4',
      mimeType: 'video/mp4',
      size: BigInt(25000000), // 25MB
      duration: 300, // 5 minutes
      thumbnail: 'https://via.placeholder.com/640x360/1a1a2e/16213e?text=Pro+Strategy',
      tags: ['strategy', 'competitive', 'tutorial'],
      category: 'gameplay',
      isPublic: true,
      viewCount: 256,
    },
  });

  console.log('✅ Created sample videos:', { video1, video2, video3 });
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
