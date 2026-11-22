import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // O navegador precisa sempre conferir se há um service worker novo.
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] }];
  },
};

export default nextConfig;
