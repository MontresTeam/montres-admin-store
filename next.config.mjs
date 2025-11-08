/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: ["technodsolutions.com","res.cloudinary.com","via.placeholder.com"], 
    unoptimized: true, // ✅ placed correctly outside of domains array
  },
};

export default nextConfig;
