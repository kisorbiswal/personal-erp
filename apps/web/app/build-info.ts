export const BUILD_INFO = {
  // Prefer Vercel-provided metadata. Some projects accidentally keep
  // NEXT_PUBLIC_GIT_SHA / NEXT_PUBLIC_BUILD_TIME pinned in env vars,
  // which makes the footer look "stuck" across deployments.
  sha:
    (process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : '') ||
    process.env.NEXT_PUBLIC_GIT_SHA ||
    'unknown',

  // Try multiple sources.
  builtAt:
    process.env.VERCEL_BUILD_TIME ||
    process.env.NEXT_PUBLIC_BUILD_TIME ||
    // Fallback: evaluated when the module is bundled/loaded.
    // Prevents the footer from ever showing "time unknown".
    new Date().toISOString(),

  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
};
