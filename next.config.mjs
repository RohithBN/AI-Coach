/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // PDF.js worker configuration
    if (!isServer) {
      config.resolve.alias['pdfjs-dist/build/pdf.worker.entry'] = 'pdfjs-dist/build/pdf.worker.min.js';
    }
    
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;