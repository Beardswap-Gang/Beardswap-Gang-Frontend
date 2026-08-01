/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Freighter and other wallet extensions inject globals that only exist
  // client-side; keep server bundles from trying to resolve them.
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    return config;
  },
};

module.exports = nextConfig;
