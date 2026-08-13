import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "nasirsir",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
};
export default nextConfig;
