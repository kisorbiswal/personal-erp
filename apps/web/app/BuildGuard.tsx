'use client';

import { useEffect, useState } from 'react';
import { BUILD_INFO } from './build-info';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // check every 5 minutes

export function BuildGuard() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const currentSha = BUILD_INFO.sha;
    if (!currentSha || currentSha === 'unknown') return;

    async function checkForUpdate() {
      try {
        const res = await fetch('/api/build', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.sha && data.sha !== currentSha) {
          setUpdateAvailable(true);
        }
      } catch {
        // ignore network errors
      }
    }

    // Poll every 5 minutes
    const interval = setInterval(checkForUpdate, POLL_INTERVAL_MS);
    // Also check once after 30s (catches quick redeploys)
    const warmup = setTimeout(checkForUpdate, 30_000);

    return () => {
      clearInterval(interval);
      clearTimeout(warmup);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#1e293b',
      color: '#f8fafc',
      padding: '12px 20px',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      fontSize: 14,
      whiteSpace: 'nowrap',
    }}>
      <span>🚀 New version available</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Reload
      </button>
      <button
        onClick={() => setUpdateAvailable(false)}
        style={{
          background: 'transparent',
          color: '#94a3b8',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          padding: '6px 4px',
        }}
      >
        Later
      </button>
    </div>
  );
}
