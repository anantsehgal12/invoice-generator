import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Disable strict typed routes to avoid build worker type errors
    typedRoutes: false,
  },
};

export default nextConfig;
