'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type BoardItem = { id: string; name: string };

export function TabsBar({ activeBoardId }: { activeBoardId?: string }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const [boards, setBoards] = useState<BoardItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${base}/boards`, { credentials: 'include' });
        if (!res.ok) return;
        const j = await res.json();
        setBoards((j.items || []).map((b: any) => ({ id: b.id, name: b.name })));
      } catch {
        // ignore
      }
    })();
  }, [base]);

  if (!boards.length) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      {boards.map((b) => {
        const active = b.id === activeBoardId;
        return (
          <Link
            key={b.id}
            href={`/boards/${b.id}`}
            className={`tab ${active ? 'tabActive' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            {b.name}
          </Link>
        );
      })}
    </div>
  );
}
