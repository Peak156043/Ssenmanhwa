/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Images are 800px wide — these breakpoints let Next.js serve
    // appropriately sized variants to mobile/tablet/desktop.
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200],
    imageSizes: [128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.supabase.co' },
      // รองรับ URL ที่มาจาก Cloudflare Tunnel (TryCloudflare)
      { protocol: 'https', hostname: '**.trycloudflare.com' },
      // Local Supabase Storage (via `supabase start`) serves uploaded
      // images from this host — needed for dev only. Production points
      // NEXT_PUBLIC_SUPABASE_URL at your real server/domain instead, which
      // is already covered by the supabase.co pattern above or should be
      // added here explicitly if self-hosting under your own domain.
      { protocol: 'http', hostname: '127.0.0.1', port: '54321' },
      { protocol: 'http', hostname: 'localhost', port: '54321' },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB which is too small for bulk chapter image uploads.
      // 50MB covers a full chapter of ~20 high-res pages comfortably.
      // For very long chapters or lossless source files, raise this further.
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config) => {
    // Suppress specific Webpack warnings from third-party libraries and internal cache
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/supabase-js/ },
      /Serializing big strings/,
      /Critical dependency: the request of a dependency is an expression/
    ];
    return config;
  },
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
