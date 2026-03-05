export const BUILD_INFO = {
  sha:
    process.env.NEXT_PUBLIC_GIT_SHA ||
    (process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : '') ||
    'unknown',

  // Try multiple sources.
  builtAt:
    process.env.NEXT_PUBLIC_BUILD_TIME ||
    process.env.VERCEL_BUILD_TIME ||
    // Fallback: evaluated when the module is bundled/loaded.
    // Prevents the footer from ever showing "time unknown".
    new Date().toISOString(),

  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
};
