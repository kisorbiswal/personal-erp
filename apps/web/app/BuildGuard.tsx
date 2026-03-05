'use client';

import { useEffect } from 'react';
import { BUILD_INFO } from './build-info';

// Prevent stale UI after deploy without breaking Next asset paths.
export function BuildGuard() {
  useEffect(() => {
    try {
      const key = 'life_build_sha';
      const prev = localStorage.getItem(key);
      const cur = BUILD_INFO.sha;
      if (prev && cur && prev !== cur) {
        // Force a reload with cache-busting param.
        const u = new URL(window.location.href);
        u.searchParams.set('__v', cur);
        localStorage.setItem(key, cur);
        window.location.replace(u.toString());
        return;
      }
      if (cur) localStorage.setItem(key, cur);
    } catch {
      // ignore
    }
  }, []);

  return null;
}
