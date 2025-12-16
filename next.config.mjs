/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Reduce bundle size
  swcMinify: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
