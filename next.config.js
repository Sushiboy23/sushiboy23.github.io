/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",          // ⬅️ THIS is why out/ doesn’t exist
    images: {
      unoptimized: true        // required for GitHub Pages
    },
    trailingSlash: true
  };
  
  module.exports = nextConfig;
  
