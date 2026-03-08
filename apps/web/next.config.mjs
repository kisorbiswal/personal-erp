/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      // HTML pages: serve from cache instantly, revalidate in background every 60s.
      // Browser never shows stale content >10min (stale-while-revalidate=600).
      // App polls /api/build and shows a banner when a new deploy is detected.
      {
        source: '/((?!_next/static|_next/image|favicon.ico|api).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=600' },
        ],
      },
      // API routes: never cache
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      // Content-hashed static assets: cache forever (safe — filename changes on every build)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
