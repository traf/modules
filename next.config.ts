import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/api/icons/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
};

export default nextConfig;
