import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  poweredByHeader: false,

  // fail the build if there are any TypeScript errors
  typescript: {
    ignoreBuildErrors: false,
  },
  
};

export default nextConfig;
