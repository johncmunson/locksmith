import type { NextConfig } from "next";

const vercelBlobDomain = process.env.VERCEL_BLOB_DOMAIN!;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`${vercelBlobDomain}/**`)],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
