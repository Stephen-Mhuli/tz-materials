import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9100",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9100",
      },
      {
        protocol: "http",
        hostname: "backend",
      },
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
      },
    ],
  },
};

export default nextConfig;
