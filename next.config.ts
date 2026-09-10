import type { NextConfig } from "next";

const configuredApiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8007";
const normalizedApiUrl = configuredApiUrl.replace(/\/$/, "");
const apiDestination = normalizedApiUrl.endsWith("/api")
  ? `${normalizedApiUrl}/:path*`
  : `${normalizedApiUrl}/api/:path*`;

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: apiDestination,
      },
    ];
  },
};

export default nextConfig;
