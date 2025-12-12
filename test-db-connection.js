require('dotenv').config();
const { prisma } = require('./src/lib/database/prisma.ts');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Try to connect and query
    const count = await prisma.video.count();
    console.log('✅ Database connection successful!');
    console.log(`Found ${count} videos in database`);
    
    // Try to fetch one video
    const videos = await prisma.video.findMany({ take: 1 });
    console.log('Sample video:', videos[0] || 'No videos found');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
