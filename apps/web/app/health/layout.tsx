'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_CACHE_KEY = 'life_auth_user';

const SESSION_CACHE_TTL = 1000 * 60 * 10; // re-verify every 10 min

function getCachedAuth() {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const { user, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { sessionStorage.removeItem(SESSION_CACHE_KEY); return null; }
    return user;
  } catch { return null; }
}

function setCachedAuth(user: unknown) {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ user, expiresAt: Date.now() + SESSION_CACHE_TTL }));
  } catch {}
}

function getBoardsLink() {
  try { const id = localStorage.getItem('lastBoardId'); if (id) return `/boards/${id}`; } catch {}
  return '/';
}

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [boardsLink, setBoardsLink] = useState('/');
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => { setBoardsLink(getBoardsLink()); }, []);

  useEffect(() => {
    // Use sessionStorage cache (10 min TTL) to avoid /auth/me on every render
    if (getCachedAuth()) { setAuthed(true); return; }
    fetch(`${base}/auth/me`, { credentials: 'include', cache: 'no-store' })
      .then((r) => {
        // Only logout on explicit auth failures — not network errors
        if (r.status === 401 || r.status === 403) {
          try { sessionStorage.removeItem(SESSION_CACHE_KEY); localStorage.removeItem('lastBoardId'); } catch {}
          router.replace('/');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return; // already handled above
        if (d?.user) { setCachedAuth(d.user); setAuthed(true); }
        else { router.replace('/'); }
      })
      .catch(() => {
        // Network error — don't logout, just show a retry state
        setAuthed(false);
      });
  }, [base, router]);

  if (authed === null) return (
    <div style={{ padding: 32, color: '#9ca3af', fontSize: 14 }}>Checking session…</div>
  );
  if (authed === false) return (
    <div style={{ padding: 32, fontSize: 14 }}>
      <div style={{ color: '#ef4444', marginBottom: 12 }}>Could not reach server. Check your connection.</div>
      <button className="tab" onClick={() => { setAuthed(null); }}>Retry</button>
    </div>
  );

  return (
    <div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
        <a
          href={boardsLink}
          style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13, marginRight: 8 }}
        >
          ← Boards
        </a>
        {[
          { href: '/health/sources', label: 'Sources' },
          { href: '/health/dashboard', label: 'Dashboard' },
          { href: '/health/dev', label: 'Dev' },
        ].map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={active ? 'tab tabActive' : 'tab'}
              style={{ textDecoration: 'none' }}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
