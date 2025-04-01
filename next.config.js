const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Add SEO optimizations
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  // Handle common redirects
  async redirects() {
    return [
      {
        source: '/inspections',
        destination: '/history',
        permanent: true,
      },
      {
        source: '/start',
        destination: '/new',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Simplified webpack config without problematic cache settings
  webpack: (config, { dev }) => {
    // Basic webpack customizations if needed
    return config;
  },
  // Ensure no API routes are generated
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('api')),
};

module.exports = nextConfig;