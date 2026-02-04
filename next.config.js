/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "",
};

module.exports = nextConfig;
/**Test change 4: website was crashing as github was deploying change from branch (deploying old stock file ) while Yaml was triggering the 
 * latest up to date deployment files 
 */