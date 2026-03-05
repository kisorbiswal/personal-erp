'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type BoardItem = { id: string; name: string };

export function TabsBar({ activeBoardId }: { activeBoardId?: string }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const dragIdRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${base}/boards`, { credentials: 'include' });
        if (!res.ok) return;
        const j = await res.json();
        const fetched: BoardItem[] = (j.items || []).map((b: any) => ({ id: b.id, name: b.name }));

        // Apply user order (localStorage) if present.
        try {
          const raw = localStorage.getItem('boardOrderIds');
          const order = raw ? (JSON.parse(raw) as string[]) : null;
          if (order && Array.isArray(order) && order.length) {
            const pos = new Map(order.map((id, idx) => [id, idx] as const));
            fetched.sort((a, b) => {
              const pa = pos.has(a.id) ? (pos.get(a.id) as number) : 1e9;
              const pb = pos.has(b.id) ? (pos.get(b.id) as number) : 1e9;
              if (pa !== pb) return pa - pb;
              return a.name.localeCompare(b.name);
            });
          }
        } catch {
          // ignore
        }

        setBoards(fetched);
      } catch {
        // ignore
      }
    })();
  }, [base]);

  const [defaultBoardId, setDefaultBoardId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDefaultBoardId(localStorage.getItem('landingBoardId'));
    } catch {
      setDefaultBoardId(null);
    }

    function onStorage(e: StorageEvent) {
      if (e.key === 'landingBoardId') {
        setDefaultBoardId(e.newValue);
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [activeBoardId]);

  if (!boards.length) return null;

  function persistOrder(next: BoardItem[]) {
    try {
      localStorage.setItem('boardOrderIds', JSON.stringify(next.map((b) => b.id)));
    } catch {
      // ignore
    }
  }

  function moveBoard(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIdx = boards.findIndex((b) => b.id === fromId);
    const toIdx = boards.findIndex((b) => b.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = boards.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setBoards(next);
    persistOrder(next);
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      {boards.map((b) => {
        const active = b.id === activeBoardId;
        const isDefault = defaultBoardId === b.id;

        return (
          <Link
            key={b.id}
            href={`/boards/${b.id}`}
            className={`tab ${active ? 'tabActive' : ''}`}
            style={{ textDecoration: 'none', userSelect: 'none' }}
            draggable
            onDragStart={() => {
              dragIdRef.current = b.id;
            }}
            onDragOver={(e) => {
              // allow drop
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragIdRef.current;
              dragIdRef.current = null;
              if (!from) return;
              moveBoard(from, b.id);
            }}
            title={isDefault ? 'Default board' : 'Drag to reorder'}
          >
            {b.name}
            {isDefault ? <span style={{ fontSize: 11, opacity: 0.9 }}>(default)</span> : null}
          </Link>
        );
      })}
    </div>
  );
}
