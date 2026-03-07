'use client';

import { useEffect } from 'react';
import { BUILD_INFO } from './build-info';

// Prevent stale UI after deploy. Uses sessionStorage (not localStorage — no user data persisted).
export function BuildGuard() {
  useEffect(() => {
    try {
      const key = 'life_build_sha';
      const prev = sessionStorage.getItem(key);
      const cur = BUILD_INFO.sha;
      if (prev && cur && prev !== cur) {
        const u = new URL(window.location.href);
        u.searchParams.set('__v', cur);
        sessionStorage.setItem(key, cur);
        window.location.replace(u.toString());
        return;
      }
      if (cur) sessionStorage.setItem(key, cur);
    } catch {
      // ignore
    }
  }, []);

  return null;
}
