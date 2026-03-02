'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type MeResponse = { user: null | { email: string; name?: string | null } };

type BoardItem = { id: string; name: string; updatedAt: string };

type BoardsResponse = { items: BoardItem[] };

export default function HomePage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [me, setMe] = useState<MeResponse | null>(null);
  const [boards, setBoards] = useState<BoardsResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch(`${base}/auth/me`, { credentials: 'include' });
        const meJson = (await meRes.json()) as MeResponse;
        setMe(meJson);
        if (meJson.user) {
          const bRes = await fetch(`${base}/boards`, { credentials: 'include' });
          if (!bRes.ok) throw new Error(`Failed to load boards: HTTP ${bRes.status}`);
          setBoards((await bRes.json()) as BoardsResponse);
        }
      } catch (e: any) {
        setErr(e?.message || String(e));
      }
    })();
  }, [base]);

  if (err) return <div>Error: {err}</div>;
  if (!me) return <div>Loading...</div>;

  if (!me.user) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <p>You are not signed in.</p>
        <a
          href={`${base}/auth/google`}
          style={{ display: 'inline-block', padding: '10px 14px', border: '1px solid #111', borderRadius: 8 }}
        >
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

      <ul>
        {boards.items.map((b) => (
          <li key={b.id} style={{ marginBottom: 8 }}>
            <Link href={`/boards/${b.id}`}>{b.name}</Link>
            <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
              updated {new Date(b.updatedAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
