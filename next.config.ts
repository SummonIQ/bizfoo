import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "platejs",
    "@platejs/basic-nodes",
    "@platejs/link",
    "@platejs/list",
    "@platejs/markdown",
    "@platejs/dnd",
    "@platejs/selection",
    "@platejs/core",
    "@platejs/utils",
    "jotai",
    "jotai-x",
    "jotai-optics",
  ],
  experimental: {
    typedRoutes: false,
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
};

export default config;
