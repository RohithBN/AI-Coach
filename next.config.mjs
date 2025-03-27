/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during the production build
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me", // Allows fetching images from randomuser.me
      },
    ],
  },
};

export default nextConfig;
