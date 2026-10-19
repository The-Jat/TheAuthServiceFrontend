import type { NextConfig } from 'next';

// In production Caddy sends /api/* straight to the auth service. In local dev
// (`npm run dev`) there is no Caddy, so Next proxies /api/* itself.
const apiTarget = process.env.AUTH_API_INTERNAL_URL;

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return apiTarget ? [{ source: '/api/:path*', destination: `${apiTarget.replace(/\/+$/, '')}/api/:path*` }] : [];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
