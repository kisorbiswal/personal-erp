'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_CACHE_KEY = 'life_auth_user';
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedAuth(): { email: string; name?: string | null } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const { user, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { sessionStorage.removeItem(SESSION_CACHE_KEY); return null; }
    return user;
  } catch { return null; }
}

function setCachedAuth(user: { email: string; name?: string | null } | null) {
  try {
    if (user) {
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ user, expiresAt: Date.now() + SESSION_CACHE_TTL_MS }));
    } else {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {}
}

function getLastBoardId(): string | null {
  try { return localStorage.getItem('lastBoardId'); } catch { return null; }
}

export default function HomePage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // 1. Try last-opened board with cached auth — fastest path, no API call
      const cachedUser = getCachedAuth();
      const lastBoardId = getLastBoardId();
      if (cachedUser && lastBoardId) {
        router.replace(`/boards/${lastBoardId}`);
        return;
      }

      // 2. Check auth via network (but short-cache the result)
      try {
        const res = await fetch(`${base}/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (res.status === 401 || res.status === 403) {
          setCachedAuth(null);
          setError('not_authenticated');
          return;
        }

        const meJson = await res.json();
        if (!meJson?.user) {
          setCachedAuth(null);
          setError('not_authenticated');
          return;
        }

        setCachedAuth(meJson.user);

        // 3. Go to last board if known, else fetch board list
        if (lastBoardId) {
          router.replace(`/boards/${lastBoardId}`);
          return;
        }

        const bRes = await fetch(`${base}/boards`, { credentials: 'include', cache: 'no-store' });
        const bJson = await bRes.json();
        const firstBoard = (bJson.items || [])[0];
        if (firstBoard) {
          try { localStorage.setItem('lastBoardId', firstBoard.id); } catch {}
          router.replace(`/boards/${firstBoard.id}`);
        } else {
          setError('no_boards');
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error === 'not_authenticated') {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <p>You are not signed in.</p>
        <a href={`${base}/auth/google`} className="tab" style={{ textDecoration: 'none' }}>
          Sign in with Google
        </a>
      </div>
    );
  }

  if (error === 'no_boards') {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <p>No boards yet. Open the app and create one.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <div style={{ color: '#b91c1c', marginBottom: 12 }}>Error: {error}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={`${base}/auth/google`} className="tab" style={{ textDecoration: 'none' }}>Sign in with Google</a>
          <button className="tab" onClick={() => { setError(null); window.location.reload(); }}>Retry</button>
        </div>
      </div>
    );
  }

  // Show minimal loading — usually resolves in <100ms from cache
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#666', fontSize: 14 }}>
      <div style={{
        width: 16, height: 16, border: '2px solid #e5e7eb', borderTopColor: '#6366f1',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      }} />
      Opening…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
