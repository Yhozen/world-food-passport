import type { NextConfig } from "next";

const nextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
} satisfies NextConfig;

export default nextConfig;
