'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_CACHE_KEY = 'life_auth_user';

function getCachedAuth() {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const { user, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { sessionStorage.removeItem(SESSION_CACHE_KEY); return null; }
    return user;
  } catch { return null; }
}

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    // Use cached auth first, then verify with API if needed
    if (getCachedAuth()) { setAuthed(true); return; }
    fetch(`${base}/auth/me`, { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) { setAuthed(true); }
        else { router.replace('/'); }
      })
      .catch(() => router.replace('/'));
  }, [base, router]);

  if (authed === null) return (
    <div style={{ padding: 32, color: '#9ca3af', fontSize: 14 }}>Checking session…</div>
  );

  return (
    <div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
        <a
          href="/boards"
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
