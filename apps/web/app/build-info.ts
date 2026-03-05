export const BUILD_INFO = {
  // Prefer explicit values we pass during deploy, fall back to Vercel-provided commit SHA.
  sha:
    process.env.NEXT_PUBLIC_GIT_SHA ||
    (process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : '') ||
    'unknown',

  // Never fall back to "now" (misleading). If missing, show unknown.
  builtAt: process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown',

  // Useful for debugging caching issues.
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
};
