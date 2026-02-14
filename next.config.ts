import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimisations pour Cloudflare avec OpenNext
  images: {
    unoptimized: true, // Cloudflare ne supporte pas l'optimisation d'images Next.js native
  },
  // Configuration pour le edge runtime
  experimental: {
    // Permettre le streaming SSR
  },
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
