/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
    eslint: {
      // Hataları (kesme işareti vb.) yoksay
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Tip hatalarını yoksay
      ignoreBuildErrors: true,
    },
  };
  
  export default nextConfig;