import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  experimental: {
    // Disable module optimization for better compatibility
    optimizeCss: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
