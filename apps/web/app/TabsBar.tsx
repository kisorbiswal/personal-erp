'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type BoardItem = { id: string; name: string };

type RenameBoardResponse = { id: string; name: string };

type CreateBoardResponse = { id: string; name: string };

export function TabsBar({ activeBoardId }: { activeBoardId?: string }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const dragIdRef = useRef<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

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
    // Persist to DB
    fetch(`${base}/boards/reorder`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: next.map((b) => b.id) }),
    }).catch(() => { /* ignore */ });
  }

  async function renameBoard(id: string, nextName: string) {
    const name = nextName.trim();
    if (!name) return;

    const res = await fetch(`${base}/boards/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Rename failed: HTTP ${res.status} ${text}`);
    }

    const j = (await res.json()) as RenameBoardResponse;
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, name: j.name } : b)));
  }

  async function createBoard() {
    const name = prompt('New board name? (leave blank for auto)');

    const trimmed = (name || '').trim();
    const fallback = `Board ${boards.length + 1}`;

    const res = await fetch(`${base}/boards`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: trimmed || fallback }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Create board failed: HTTP ${res.status} ${text}`);
    }

    const j = (await res.json()) as CreateBoardResponse;
    const next = [...boards, { id: j.id, name: j.name }];
    setBoards(next);
    persistOrder(next);

    // Navigate to the new board.
    window.location.href = `/boards/${j.id}`;
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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
      {boards.map((b) => {
        const active = b.id === activeBoardId;
        const isDefault = defaultBoardId === b.id;
        const isEditing = editingId === b.id;

        return (
          <div
            key={b.id}
            className={`tab ${active ? 'tabActive' : ''}`}
            style={{ textDecoration: 'none', userSelect: 'none' }}
            draggable={!isEditing}
            onDragStart={() => {
              dragIdRef.current = b.id;
            }}
            onDragOver={(e) => {
              if (isEditing) return;
              // allow drop
              e.preventDefault();
            }}
            onDrop={(e) => {
              if (isEditing) return;
              e.preventDefault();
              const from = dragIdRef.current;
              dragIdRef.current = null;
              if (!from) return;
              moveBoard(from, b.id);
            }}
            title={isDefault ? 'Default board' : 'Drag to reorder'}
          >
            {isEditing ? (
              <input
                autoFocus
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingId(null);
                    setEditingText('');
                  }
                  if (e.key === 'Enter') {
                    renameBoard(b.id, editingText)
                      .then(() => {
                        setEditingId(null);
                        setEditingText('');
                      })
                      .catch((err) => alert(err?.message || String(err)));
                  }
                }}
                onBlur={() => {
                  if (!editingText.trim()) {
                    setEditingId(null);
                    setEditingText('');
                    return;
                  }
                  renameBoard(b.id, editingText)
                    .then(() => {
                      setEditingId(null);
                      setEditingText('');
                    })
                    .catch((err) => alert(err?.message || String(err)));
                }}
                style={{
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 8,
                  padding: '2px 6px',
                  fontSize: 13,
                  minWidth: 110,
                }}
              />
            ) : (
              <>
                <Link href={`/boards/${b.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {b.name}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingId(b.id);
                    setEditingText(b.name);
                  }}
                  title="Rename"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    marginLeft: 6,
                    color: active ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  ✎
                </button>
              </>
            )}
          </div>
        );
      })}

      <button
        className="tab"
        onClick={() => {
          createBoard().catch((e) => alert(e?.message || String(e)));
        }}
        title="Create new board"
        style={{ cursor: 'pointer' }}
      >
        +
      </button>
    </div>
  );
}
