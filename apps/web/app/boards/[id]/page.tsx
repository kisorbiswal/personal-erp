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
      tagsAny?: string[]; // we will enforce 1 tag in UI
      tagsNot?: string[];
      limit?: number;
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
  const [showDone, setShowDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // per-record editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // bulk selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const tagNames = useMemo(() => new Set(tags.map((t) => t.name)), [tags]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

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
      body: JSON.stringify({ includeDone: showDone }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Run failed: HTTP ${res.status}`);
    const d = await res.json();
    setData(d);
    // clear selection when data reloads
    setSelected({});
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
  }, [params.id, showDone]);

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

  function setColumnTag(sectionId: string, tag: string) {
    if (!board) return;
    const next: BoardConfigV1 = {
      ...board.config,
      sections: board.config.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              id: `tag:${tag}`,
              title: tag,
              query: { ...(s.query || {}), tagsAny: [tag] },
            }
          : s,
      ),
    };
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  async function bulkAddTag(tag: string) {
    if (!selectedIds.length) return;
    if (!confirm(`Add tag "${tag}" to ${selectedIds.length} items?`)) return;
    const res = await fetch(`${base}/events/bulk/tags/add`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventIds: selectedIds, tag }),
    });
    if (!res.ok) throw new Error(`Bulk add failed: HTTP ${res.status}`);
    await runBoard();
  }

  async function bulkRemoveTag(tag: string) {
    if (!selectedIds.length) return;
    if (!confirm(`Remove tag "${tag}" from ${selectedIds.length} items?`)) return;
    const res = await fetch(`${base}/events/bulk/tags/remove`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventIds: selectedIds, tag }),
    });
    if (!res.ok) throw new Error(`Bulk remove failed: HTTP ${res.status}`);
    await runBoard();
  }

  async function saveContent(eventId: string, content: string) {
    if (!confirm('Save changes to this record content?')) return;
    const res = await fetch(`${base}/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(`Save content failed: HTTP ${res.status}`);
    setEditingId(null);
    setEditingText('');
    await runBoard();
  }

  if (error) return <div>Error: {error}</div>;
  if (!board || !data) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Link href="/">← All boards</Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selectedIds.length ? (
            <>
              <button onClick={() => bulkAddTag('done')}>Mark done</button>
              <button onClick={() => bulkRemoveTag('done')}>Mark not done</button>
            </>
          ) : null}
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#444' }}>
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
            Show done
          </label>
          <button onClick={() => setEdit((v) => !v)}>{edit ? 'Done editing columns' : 'Edit columns'}</button>
        </div>
      </div>

      <h1 style={{ marginTop: 0 }}>{board.name}</h1>

      {edit ? (
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Add a column (one tag per column)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.slice(0, 40).map((t) => (
              <button key={t.id} onClick={() => addColumn(t.name)} style={{ padding: '6px 10px' }}>
                + {t.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {data.sections.map((s: any) => {
          const sectionCfg = board.config.sections.find((x) => x.id === s.id);
          const tag = (sectionCfg?.query?.tagsAny || [])[0] || s.title;

          return (
            <div key={s.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: 0 }}>{tag}</h3>
                <span style={{ color: '#666', fontSize: 12 }}>
                  {s.items.length} shown
                  {s.hiddenDoneCount ? ` • ${s.hiddenDoneCount} hidden(done)` : ''}
                </span>
              </div>

              {edit ? (
                <div style={{ marginTop: 10, padding: 10, background: '#fafafa', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, marginBottom: 6, color: '#444' }}>Tag for this column</div>
                  <input
                    list="all-tags"
                    defaultValue={tag}
                    style={{ width: '100%', padding: 8 }}
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (!next) return;
                      if (!tagNames.has(next)) return;
                      setColumnTag(s.id, next);
                    }}
                  />
                  <datalist id="all-tags">
                    {tags.map((t) => (
                      <option key={t.id} value={t.name} />
                    ))}
                  </datalist>

                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => removeColumn(s.id)} style={{ color: 'white', background: '#b91c1c', padding: '6px 10px' }}>
                      Remove column (presentation only)
                    </button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    Done items are always hidden.
                  </div>
                </div>
              ) : null}

              <ul style={{ paddingLeft: 18 }}>
                {s.items.slice(0, 50).map((it: any) => {
                  const isSelected = !!selected[it.id];
                  return (
                    <li key={it.id} style={{ margin: '10px 0' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => setSelected((prev) => ({ ...prev, [it.id]: e.target.checked }))}
                          style={{ marginTop: 4 }}
                        />

                        <div style={{ flex: 1 }}>
                          {editingId === it.id ? (
                            <>
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                rows={4}
                                style={{ width: '100%', padding: 8 }}
                              />
                              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                <button onClick={() => saveContent(it.id, editingText)}>Save</button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingText('');
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <div style={{ whiteSpace: 'pre-wrap' }}>{it.content}</div>
                          )}

                          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                            {new Date(it.occurredAt).toLocaleString()} • {it.tags.join(', ')}
                            {it.pinned ? ' • pinned' : ''}
                          </div>

                          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                setEditingId(it.id);
                                setEditingText(it.content);
                              }}
                            >
                              Edit text
                            </button>
                            <button onClick={() => bulkAddTag('done')}>Done (bulk)</button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
