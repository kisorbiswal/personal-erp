'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type TagItem = { id: string; name: string; count: number };

type BoardConfigV1 = {
  version: 1;
  sections: Array<{
    id: string;
    title: string;
    query: {
      tagsAny?: string[];
      tagsNot?: string[];
      limit?: number;
      includeDone?: boolean;
    };
    render: { type: 'list' | 'kanban' | 'chart' };
  }>;
};

export default function BoardPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [data, setData] = useState<any>(null);
  const [board, setBoard] = useState<{ id: string; name: string; config: BoardConfigV1 } | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagNames = useMemo(() => new Set(tags.map((t) => t.name)), [tags]);

  async function fetchBoardAndTags() {
    const bRes = await fetch(`${base}/boards/${params.id}`, { credentials: 'include' });
    if (!bRes.ok) throw new Error(`Board load failed: HTTP ${bRes.status}`);
    const b = await bRes.json();
    setBoard({ id: b.id, name: b.name, config: b.config });

    const tRes = await fetch(`${base}/tags?limit=2000`, { credentials: 'include' });
    if (tRes.ok) {
      const tj = await tRes.json();
      setTags(tj.items || []);
    }
  }

  async function runBoard() {
    const res = await fetch(`${base}/boards/${params.id}/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Run failed: HTTP ${res.status}`);
    setData(await res.json());
  }

  useEffect(() => {
    (async () => {
      try {
        await fetchBoardAndTags();
        await runBoard();
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function saveBoardConfig(next: BoardConfigV1) {
    if (!board) return;
    const res = await fetch(`${base}/boards/${board.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ config: next }),
    });
    if (!res.ok) throw new Error(`Save failed: HTTP ${res.status}`);
    const updated = await res.json();
    setBoard({ id: updated.id, name: updated.name, config: updated.config });
    await runBoard();
  }

  function addColumn(tag: string) {
    if (!board) return;
    if (!tagNames.has(tag)) return;
    const existing = board.config.sections.find((s) => (s.query.tagsAny || []).includes(tag));
    if (existing) return;

    const next: BoardConfigV1 = {
      ...board.config,
      sections: [
        ...board.config.sections,
        {
          id: `tag:${tag}`,
          title: tag,
          query: { tagsAny: [tag], limit: 50 },
          render: { type: 'list' },
        },
      ],
    };
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  function removeColumn(sectionId: string) {
    if (!board) return;
    const next: BoardConfigV1 = {
      ...board.config,
      sections: board.config.sections.filter((s) => s.id !== sectionId),
    };
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  function setColumnTags(sectionId: string, tagsAny: string[]) {
    if (!board) return;
    const next: BoardConfigV1 = {
      ...board.config,
      sections: board.config.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              title: tagsAny.length === 1 ? tagsAny[0] : s.title,
              query: { ...(s.query || {}), tagsAny },
            }
          : s,
      ),
    };
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  if (error) return <div>Error: {error}</div>;
  if (!board || !data) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/">← All boards</Link>
        <button onClick={() => setEdit((v) => !v)}>{edit ? 'Done editing' : 'Edit columns'}</button>
      </div>

      <h1 style={{ marginTop: 0 }}>{board.name}</h1>

      {edit ? (
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Add a column by tag</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.slice(0, 40).map((t) => (
              <button key={t.id} onClick={() => addColumn(t.name)} style={{ padding: '6px 10px' }}>
                + {t.name}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, color: '#666', fontSize: 12 }}>
            Tip: you can edit each column to include multiple tags.
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {data.sections.map((s: any) => {
          const sectionCfg = board.config.sections.find((x) => x.id === s.id);
          const tagsAny = sectionCfg?.query?.tagsAny || [];

          return (
            <div key={s.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: 0 }}>{s.title}</h3>
                <span style={{ color: '#666', fontSize: 12 }}>{s.items.length}</span>
              </div>

              <div style={{ marginTop: 6, color: '#888', fontSize: 12 }}>
                tags: {(tagsAny.length ? tagsAny : ['(none)']).join(', ')}
              </div>

              {edit ? (
                <div style={{ marginTop: 10, padding: 10, background: '#fafafa', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#444' }}>Column tags (comma separated)</div>
                  <input
                    defaultValue={tagsAny.join(',')}
                    style={{ width: '100%', padding: 8 }}
                    onBlur={(e) => {
                      const nextTags = e.target.value
                        .split(',')
                        .map((x) => x.trim())
                        .filter(Boolean);
                      setColumnTags(s.id, nextTags);
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => removeColumn(s.id)} style={{ color: 'white', background: '#b91c1c', padding: '6px 10px' }}>
                      Remove column
                    </button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    Done items are always hidden.
                  </div>
                </div>
              ) : null}

              <ul style={{ paddingLeft: 18 }}>
                {s.items.slice(0, 30).map((it: any) => (
                  <li key={it.id} style={{ margin: '8px 0' }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{it.content}</div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                      {new Date(it.occurredAt).toLocaleString()} • {it.tags.join(', ')}
                      {it.pinned ? ' • pinned' : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
