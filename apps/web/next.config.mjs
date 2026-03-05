/** @type {import('next').NextConfig} */
const sha = process.env.NEXT_PUBLIC_GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || '';

const nextConfig = {
  reactStrictMode: true,

  // Cache-busting: change asset URLs on every deploy so browsers pull new JS/CSS.
  // Only enable when sha is known.
  assetPrefix: sha ? `/_assets/${sha}` : undefined,
};

export default nextConfig;
