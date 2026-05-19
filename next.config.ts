import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'careersuccess.analytixlabs.co.in',
      },
      {
        protocol: 'https',
        hostname: 'www.analytixlabs.co.in',
      },
      {
        protocol: 'https',
        hostname: 'qhgelnkakutzbuvowxzj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
