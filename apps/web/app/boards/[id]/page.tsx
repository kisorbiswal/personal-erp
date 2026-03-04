'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type TagItem = { id: string; name: string; count: number };

type BoardConfigV1 = {
  version: 1;
  scopeTagsAny?: string[];
  scopeMatch?: 'any' | 'all';
  sections: Array<{
    id: string;
    title: string;
    query: {
      tagsAny?: string[];
      tagsNot?: string[];
      limit?: number;
    };
    render: { type: 'list' | 'kanban' | 'chart' };
  }>;
};

type Toast = { id: string; type: 'success' | 'error' | 'info'; text: string };

type FeedItem = { id: string; occurredAt: string; content: string; tags: string[] };

type FeedResponse = { items: FeedItem[]; nextCursor: string | null };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function BoardPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const [data, setData] = useState<any>(null);
  const [board, setBoard] = useState<{ id: string; name: string; config: BoardConfigV1 } | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [edit, setEdit] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All-board feed
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // per-record editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // bulk selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // bulk tag inputs
  const [bulkAddTagValue, setBulkAddTagValue] = useState('');
  const [bulkRemoveTagValue, setBulkRemoveTagValue] = useState('done');

  // board scope
  const [scopeDraft, setScopeDraft] = useState('');

  // per-record tag drafts
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Record<string, any>>({});

  function pushToast(type: Toast['type'], text: string) {
    const id = uid();
    setToasts((t) => [...t, { id, type, text }]);
    toastTimers.current[id] = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      delete toastTimers.current[id];
    }, 3000);
  }

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
  }

  async function loadFeedPage(reset = false) {
    if (feedLoading) return;
    setFeedLoading(true);
    try {
      const cursor = reset ? null : feedCursor;
      const url = new URL(`${base}/feed`);
      url.searchParams.set('limit', '50');
      url.searchParams.set('includeDone', showDone ? '1' : '0');
      if (cursor) url.searchParams.set('cursor', cursor);

      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) throw new Error(`Feed failed: HTTP ${res.status}`);
      const j = (await res.json()) as FeedResponse;

      setFeedItems((prev) => (reset ? j.items : [...prev, ...j.items]));
      setFeedCursor(j.nextCursor);
    } finally {
      setFeedLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await fetchBoardAndTags();
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // When board changes, either run board or load feed
  useEffect(() => {
    if (!board) return;
    if (board.name.toLowerCase() === 'all') {
      setFeedItems([]);
      setFeedCursor(null);
      loadFeedPage(true).catch((e) => setError(String(e)));
    } else {
      runBoard().catch((e) => setError(String(e)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.id]);

  // Reload board/feed when showDone changes
  useEffect(() => {
    if (!board) return;
    if (board.name.toLowerCase() === 'all') {
      setFeedItems([]);
      setFeedCursor(null);
      loadFeedPage(true).catch((e) => setError(String(e)));
    } else {
      runBoard().catch((e) => setError(String(e)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDone]);

  // Infinite scroll observer (All board)
  useEffect(() => {
    if (!board) return;
    if (board.name.toLowerCase() !== 'all') return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && feedCursor && !feedLoading) {
          loadFeedPage(false).catch((err) => setError(String(err)));
        }
      },
      { root: null, rootMargin: '600px', threshold: 0.01 },
    );

    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.id, feedCursor, feedLoading]);

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
    pushToast('success', 'Board updated');
  }

  function setBoardScopeTags(nextTags: string[]) {
    if (!board) return;
    const normalized = Array.from(new Set(nextTags.map((t) => t.trim().toLowerCase()).filter(Boolean)));
    const next: BoardConfigV1 = {
      ...board.config,
      scopeTagsAny: normalized,
    };

    setBoard({ ...board, config: next });
    runBoard().catch(() => {});

    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  function addColumn(tag: string) {
    if (!board) return;
    const t = tag.trim().toLowerCase();
    if (!t) return;

    const next: BoardConfigV1 = {
      ...board.config,
      sections: [
        ...board.config.sections,
        {
          id: `tag:${t}`,
          title: t,
          query: { tagsAny: [t], limit: 50 },
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
    const t = tag.trim().toLowerCase();
    if (!t) return;
    const next: BoardConfigV1 = {
      ...board.config,
      sections: board.config.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              id: `tag:${t}`,
              title: t,
              query: { ...(s.query || {}), tagsAny: [t] },
            }
          : s,
      ),
    };
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  function clearSelection() {
    setSelected({});
  }

  async function addTagToEvent(eventId: string, tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    const res = await fetch(`${base}/events/${eventId}/tags/add`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tag: t }),
    });
    if (!res.ok) throw new Error(`Add tag failed: HTTP ${res.status}`);
    pushToast('success', `Added tag “${t}”`);
    if (board?.name.toLowerCase() === 'all') {
      await loadFeedPage(true);
    } else {
      await runBoard();
    }
  }

  async function removeTagFromEvent(eventId: string, tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    const res = await fetch(`${base}/events/${eventId}/tags/remove`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tag: t }),
    });
    if (!res.ok) throw new Error(`Remove tag failed: HTTP ${res.status}`);
    pushToast('info', `Removed tag “${t}”`);
    if (board?.name.toLowerCase() === 'all') {
      await loadFeedPage(true);
    } else {
      await runBoard();
    }
  }

  async function bulkAddTag(tag: string) {
    if (!selectedIds.length) return;
    const t = tag.trim().toLowerCase();
    if (!t) return;
    if (!confirm(`Add tag "${t}" to ${selectedIds.length} items?`)) return;

    const res = await fetch(`${base}/events/bulk/tags/add`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventIds: selectedIds, tag: t }),
    });
    if (!res.ok) throw new Error(`Bulk add failed: HTTP ${res.status}`);
    pushToast('success', `Added tag “${t}” to ${selectedIds.length} items`);
    if (board?.name.toLowerCase() === 'all') {
      await loadFeedPage(true);
    } else {
      await runBoard();
    }
  }

  async function bulkRemoveTag(tag: string) {
    if (!selectedIds.length) return;
    const t = tag.trim().toLowerCase();
    if (!t) return;
    if (!confirm(`Remove tag "${t}" from ${selectedIds.length} items?`)) return;

    const res = await fetch(`${base}/events/bulk/tags/remove`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventIds: selectedIds, tag: t }),
    });
    if (!res.ok) throw new Error(`Bulk remove failed: HTTP ${res.status}`);
    pushToast('success', `Removed tag “${t}” from ${selectedIds.length} items`);
    if (board?.name.toLowerCase() === 'all') {
      await loadFeedPage(true);
    } else {
      await runBoard();
    }
  }

  async function bulkDelete() {
    if (!selectedIds.length) return;
    if (!confirm(`Soft-delete ${selectedIds.length} items?`)) return;
    const res = await fetch(`${base}/events/bulk/delete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventIds: selectedIds }),
    });
    if (!res.ok) throw new Error(`Delete failed: HTTP ${res.status}`);
    pushToast('success', `Deleted ${selectedIds.length} items`);
    clearSelection();
    if (board?.name.toLowerCase() === 'all') {
      await loadFeedPage(true);
    } else {
      await runBoard();
    }
  }

  async function bulkRestore() {
    if (!selectedIds.length) return;
    if (!confirm(`Restore ${selectedIds.length} items?`)) return;
    const res = await fetch(`${base}/events/bulk/restore`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventIds: selectedIds }),
    });
    if (!res.ok) throw new Error(`Restore failed: HTTP ${res.status}`);
    pushToast('success', `Restored ${selectedIds.length} items`);
    clearSelection();
    if (board?.name.toLowerCase() === 'all') {
      await loadFeedPage(true);
    } else {
      await runBoard();
    }
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
    pushToast('success', 'Saved');
    if (board?.name.toLowerCase() === 'all') {
      await loadFeedPage(true);
    } else {
      await runBoard();
    }
  }

  if (error) return <div>Error: {error}</div>;
  if (!board) return <div>Loading...</div>;

  const isAll = board.name.toLowerCase() === 'all';

  return (
    <div>
      {/* Toasts */}
      <div style={{ position: 'fixed', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #eee',
              background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#dcfce7' : '#eff6ff',
              color: '#111',
              minWidth: 260,
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Link href="/">← All boards</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#444' }}>
            <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
            Show done
          </label>
          {!isAll ? <button onClick={() => setEdit((v) => !v)}>{edit ? 'Done editing columns' : 'Edit columns'}</button> : null}
        </div>
      </div>

      {/* Sticky bulk bar */}
      {selectedIds.length ? (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid #eee',
            borderRadius: 10,
            padding: 10,
            marginBottom: 14,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <strong>Selected: {selectedIds.length}</strong>
            <button onClick={() => bulkAddTag('done').catch((e) => setError(String(e)))}>Mark done</button>
            <button onClick={() => bulkRemoveTag('done').catch((e) => setError(String(e)))}>Mark not done</button>
            <button onClick={() => bulkDelete().catch((e) => setError(String(e)))}>Delete</button>
            <button onClick={() => bulkRestore().catch((e) => setError(String(e)))}>Restore</button>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#444' }}>Add tag</span>
              <input
                value={bulkAddTagValue}
                onChange={(e) => setBulkAddTagValue(e.target.value)}
                style={{ padding: 6, minWidth: 140 }}
                placeholder="tag"
              />
              <button
                onClick={() => {
                  const t = bulkAddTagValue.trim().toLowerCase();
                  if (!t) return;
                  bulkAddTag(t).catch((e) => setError(String(e)));
                  setBulkAddTagValue('');
                }}
              >
                Apply
              </button>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#444' }}>Remove tag</span>
              <input
                value={bulkRemoveTagValue}
                onChange={(e) => setBulkRemoveTagValue(e.target.value)}
                style={{ padding: 6, minWidth: 140 }}
                placeholder="tag"
              />
              <button
                onClick={() => {
                  const t = bulkRemoveTagValue.trim().toLowerCase();
                  if (!t) return;
                  bulkRemoveTag(t).catch((e) => setError(String(e)));
                }}
              >
                Apply
              </button>
            </div>

            <button onClick={clearSelection}>Clear</button>
          </div>
        </div>
      ) : null}

      <h1 style={{ marginTop: 0 }}>{board.name}</h1>

      {/* ALL board feed */}
      {isAll ? (
        <div>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 10 }}>
            Reverse chronological feed. Scroll to load more.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feedItems.map((it) => {
              const isSelected = !!selected[it.id];
              return (
                <div key={it.id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
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
                            <button onClick={() => saveContent(it.id, editingText).catch((e) => setError(String(e)))}>Save</button>
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
                        <div className="wrap">{it.content}</div>
                      )}

                      <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                        {new Date(it.occurredAt).toLocaleString()} • {it.tags.join(', ') || '(no tags)'}
                      </div>

                      {/* tag chips */}
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {it.tags.map((tg) => (
                          <span
                            key={tg}
                            style={{
                              fontSize: 12,
                              border: '1px solid #e5e7eb',
                              background: '#f9fafb',
                              borderRadius: 999,
                              padding: '2px 8px',
                              cursor: 'pointer',
                            }}
                            title="Click to remove tag"
                            onClick={() => removeTagFromEvent(it.id, tg).catch((e) => setError(String(e)))}
                          >
                            {tg} ×
                          </span>
                        ))}
                      </div>

                      {/* add tag */}
                      <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#444' }}>Add tag</span>
                        <input
                          value={tagDrafts[it.id] || ''}
                          onChange={(e) => setTagDrafts((m) => ({ ...m, [it.id]: e.target.value }))}
                          style={{ padding: 6, minWidth: 160 }}
                          placeholder="type tag"
                        />
                        <button
                          onClick={() => {
                            const val = (tagDrafts[it.id] || '').trim().toLowerCase();
                            if (!val) return;
                            addTagToEvent(it.id, val)
                              .then(() => setTagDrafts((m) => ({ ...m, [it.id]: '' })))
                              .catch((e) => setError(String(e)));
                          }}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(it.id);
                            setEditingText(it.content);
                          }}
                        >
                          Edit text
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={sentinelRef} style={{ height: 40 }} />
          {feedLoading ? <div style={{ color: '#666', marginTop: 10 }}>Loading…</div> : null}
          {!feedCursor && !feedLoading ? <div style={{ color: '#888', marginTop: 10 }}>End.</div> : null}
        </div>
      ) : null}

      {/* Normal board columns */}
      {!isAll && data ? (
        <>
          <div style={{ marginBottom: 12, padding: 12, border: '1px solid #eee', borderRadius: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Board scope</div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(board.config.scopeTagsAny || []).length ? (
                (board.config.scopeTagsAny || []).map((t) => (
                  <span
                    key={t}
                    style={{ fontSize: 12, border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 999, padding: '2px 8px', cursor: 'pointer' }}
                    title="Remove scope tag"
                    onClick={() => setBoardScopeTags((board.config.scopeTagsAny || []).filter((x) => x !== t))}
                  >
                    {t} ×
                  </span>
                ))
              ) : (
                <span style={{ color: '#666', fontSize: 12 }}>No scope tags (board shows everything).</span>
              )}
            </div>

            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#444', marginTop: 8 }}>
              <input
                type="checkbox"
                checked={(board.config.scopeMatch || 'any') === 'all'}
                onChange={(e) => {
                  const nextMatch = e.target.checked ? 'all' : 'any';
                  const next: BoardConfigV1 = { ...board.config, scopeMatch: nextMatch };
                  setBoard({ ...board, config: next });
                  runBoard().catch(() => {});
                  saveBoardConfig(next).catch((err) => setError(String(err)));
                }}
              />
              Require ALL scope tags (instead of ANY)
            </label>

            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#444' }}>Add scope tag</span>
              <input
                value={scopeDraft}
                onChange={(e) => setScopeDraft(e.target.value)}
                style={{ padding: 6, minWidth: 180 }}
                placeholder="e.g. oracle"
              />
              <button
                onClick={() => {
                  const val = scopeDraft.trim().toLowerCase();
                  if (!val) return;
                  setScopeDraft('');
                  setBoardScopeTags([...(board.config.scopeTagsAny || []), val]);
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            {data.sections.map((s: any) => {
              const sectionCfg = board.config.sections.find((x) => x.id === s.id);
              const tag = (sectionCfg?.query?.tagsAny || [])[0] || s.title;

              return (
                <div key={s.id} className="col" style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
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
                        defaultValue={tag}
                        style={{ width: '100%', padding: 8 }}
                        onBlur={(e) => {
                          const next = e.target.value.trim().toLowerCase();
                          if (!next) return;
                          if (!tagNames.has(next)) {
                            pushToast('error', `Unknown tag: ${next}`);
                            return;
                          }
                          setColumnTag(s.id, next);
                        }}
                      />

                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => removeColumn(s.id)} style={{ color: 'white', background: '#b91c1c', padding: '6px 10px' }}>
                          Remove column (presentation only)
                        </button>
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
                                    <button onClick={() => saveContent(it.id, editingText).catch((e) => setError(String(e)))}>Save</button>
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
                                <div className="wrap">{it.content}</div>
                              )}

                              <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                                {new Date(it.occurredAt).toLocaleString()} • {it.tags.join(', ')}
                                {board.config.scopeTagsAny?.length ? (
                                  <>
                                    {' '}• scope: {(board.config.scopeTagsAny || []).filter((t) => it.tags.includes(t)).join(', ') || '—'}
                                  </>
                                ) : null}
                              </div>

                              {/* tag chips */}
                              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {it.tags.map((tg: string) => (
                                  <span
                                    key={tg}
                                    style={{
                                      fontSize: 12,
                                      border: '1px solid #e5e7eb',
                                      background: '#f9fafb',
                                      borderRadius: 999,
                                      padding: '2px 8px',
                                      cursor: 'pointer',
                                    }}
                                    title="Click to remove tag"
                                    onClick={() => removeTagFromEvent(it.id, tg).catch((e) => setError(String(e)))}
                                  >
                                    {tg} ×
                                  </span>
                                ))}
                              </div>

                              {/* add tag */}
                              <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, color: '#444' }}>Add tag</span>
                                <input
                                  value={tagDrafts[it.id] || ''}
                                  onChange={(e) => setTagDrafts((m) => ({ ...m, [it.id]: e.target.value }))}
                                  style={{ padding: 6, minWidth: 160 }}
                                  placeholder="type tag"
                                />
                                <button
                                  onClick={() => {
                                    const val = (tagDrafts[it.id] || '').trim().toLowerCase();
                                    if (!val) return;
                                    addTagToEvent(it.id, val)
                                      .then(() => setTagDrafts((m) => ({ ...m, [it.id]: '' })))
                                      .catch((e) => setError(String(e)));
                                  }}
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(it.id);
                                    setEditingText(it.content);
                                  }}
                                >
                                  Edit text
                                </button>
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
        </>
      ) : null}
    </div>
  );
}
