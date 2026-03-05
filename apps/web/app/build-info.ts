export const BUILD_INFO = {
  sha: process.env.NEXT_PUBLIC_GIT_SHA || 'dev',
  builtAt: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
};
