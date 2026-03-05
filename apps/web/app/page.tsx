'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type MeResponse = { user: null | { email: string; name?: string | null } };

type BoardItem = { id: string; name: string; updatedAt: string };

type BoardsResponse = { items: BoardItem[] };

export default function HomePage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [me, setMe] = useState<MeResponse | null>(null);
  const [boards, setBoards] = useState<BoardItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchJson(url: string, init?: RequestInit) {
    const res = await fetch(url, { ...(init || {}), credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      return { __auth: 'expired' } as any;
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text}`);
    }
    return res.json();
  }

  useEffect(() => {
    (async () => {
      try {
        const meJson: any = await fetchJson(`${base}/auth/me`);
        if (meJson?.__auth === 'expired') {
          setMe({ user: null });
          return;
        }

        setMe(meJson as MeResponse);

        if (!meJson.user) {
          setBoards(null);
          return;
        }

        const bJson = (await fetchJson(`${base}/boards`)) as BoardsResponse;
        setBoards(bJson.items);
      } catch (e: any) {
        setError(e?.message || String(e));
        // fall back to showing login
        setMe({ user: null });
      }
    })();
  }, [base]);

  if (error) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <div style={{ color: '#b91c1c', marginBottom: 12 }}>Error: {error}</div>
        <a href={`${base}/auth/google`} className="tab" style={{ textDecoration: 'none' }}>
          Sign in with Google
        </a>
      </div>
    );
  }

  if (!me) return <div>Loading...</div>;

  if (!me.user) {
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

  if (!boards) return <div>Loading boards...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Boards</h1>
        <a href={`${base}/auth/logout`} style={{ color: '#666' }}>
          Logout
        </a>
      </div>

      <div style={{ marginTop: 18 }}>
        <ul>
          {boards.map((b) => (
            <li key={b.id} style={{ marginBottom: 8 }}>
              <Link href={`/boards/${b.id}`}>{b.name}</Link>
              <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>updated {new Date(b.updatedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
