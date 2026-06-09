import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadEnv({ path: path.resolve(rootDir, ".env") });

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
      {
        source: "/api/entities",
        destination: `${apiUrl}/api/entities`,
      },
      {
        source: "/api/entity/:path*",
        destination: `${apiUrl}/api/entity/:path*`,
      },
      {
        source: "/api/roles/:path*",
        destination: `${apiUrl}/api/roles/:path*`,
      },
      {
        source: "/api/permissions/:path*",
        destination: `${apiUrl}/api/permissions/:path*`,
      },
      {
        source: "/api/grants/:path*",
        destination: `${apiUrl}/api/grants/:path*`,
      },
    ];
  },
  devIndicators: false
};

export default nextConfig;
