/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Pin the workspace root to this project so Turbopack doesn't
    // treat the home directory as the root.
    root: import.meta.dirname,
  },
};

export default nextConfig;
