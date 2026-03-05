'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type TagItem = { id: string; name: string; count: number };

type BoardConfigV1 = {
  version: 1;
  // Preferred
  columns?: Array<{
    id: string;
    title: string;
    query: {
      tagsAny?: string[];
      tagsMatch?: 'any' | 'all';
      includeDone?: boolean;
      limit?: number;
    };
    render: { type: 'list' | 'kanban' | 'chart' };
  }>;
  // Backward compat
  sections?: Array<{
    id: string;
    title: string;
    query: {
      tagsAny?: string[];
      tagsMatch?: 'any' | 'all';
      includeDone?: boolean;
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

  const [board, setBoard] = useState<{ id: string; name: string; config: BoardConfigV1 } | null>(null);
  const [data, setData] = useState<any>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // All board feed
  const [showDoneAll, setShowDoneAll] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // selection + bulk
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const [bulkAddTagValue, setBulkAddTagValue] = useState('');
  const [bulkRemoveTagValue, setBulkRemoveTagValue] = useState('done');

  // per-record edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // per-record tag drafts
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});

  // per-column tag draft
  const [colTagDrafts, setColTagDrafts] = useState<Record<string, string>>({});

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

  async function fetchJson(url: string, init?: RequestInit) {
    const res = await fetch(url, { ...(init || {}), credentials: 'include' });

    // session expired / forbidden
    if (res.status === 401 || res.status === 403) {
      window.location.replace('/');
      throw new Error('not_authenticated');
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      // some proxies return 500/502 with auth-related body; treat obvious auth failures the same
      if (/not_authenticated|unauthorized|forbidden/i.test(text)) {
        window.location.replace('/');
        throw new Error('not_authenticated');
      }
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    return res.json();
  }

  async function fetchBoardAndTags() {
    const b = await fetchJson(`${base}/boards/${params.id}`);
    setBoard({ id: b.id, name: b.name, config: b.config });

    try {
      const tj = await fetchJson(`${base}/tags?limit=2000`);
      setTags(tj.items || []);
    } catch {
      // ignore
    }
  }

  async function saveBoardConfig(next: BoardConfigV1) {
    if (!board) return;
    const updated = await fetchJson(`${base}/boards/${board.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ config: next }),
    });
    setBoard({ id: updated.id, name: updated.name, config: updated.config });
    pushToast('success', 'Board updated');
  }

  async function runBoard() {
    const d = await fetchJson(`${base}/boards/${params.id}/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    setData(d);
  }

  async function loadFeedPage(reset = false) {
    if (feedLoading) return;
    setFeedLoading(true);
    try {
      const cursor = reset ? null : feedCursor;
      const url = new URL(`${base}/feed`);
      url.searchParams.set('limit', '50');
      url.searchParams.set('includeDone', showDoneAll ? '1' : '0');
      if (cursor) url.searchParams.set('cursor', cursor);

      const j = (await fetchJson(url.toString())) as FeedResponse;

      setFeedItems((prev) => (reset ? j.items : [...prev, ...j.items]));
      setFeedCursor(j.nextCursor);
    } finally {
      setFeedLoading(false);
    }
  }

  function clearSelection() {
    setSelected({});
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

    // optimistic UI update
    if (board?.name.toLowerCase() === 'all') {
      setFeedItems((prev) =>
        prev.map((it) => (it.id === eventId ? { ...it, tags: Array.from(new Set([...(it.tags || []), t])) } : it)),
      );
    } else {
      setData((prev: any) => {
        if (!prev?.sections) return prev;
        return {
          ...prev,
          sections: prev.sections.map((sec: any) => ({
            ...sec,
            items: (sec.items || []).map((it: any) =>
              it.id === eventId ? { ...it, tags: Array.from(new Set([...(it.tags || []), t])) } : it,
            ),
          })),
        };
      });
    }

    pushToast('success', `Added tag “${t}”`);

    // reconcile from server (also updates filtering)
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

    // optimistic UI update
    if (board?.name.toLowerCase() === 'all') {
      setFeedItems((prev) => prev.map((it) => (it.id === eventId ? { ...it, tags: (it.tags || []).filter((x) => x !== t) } : it)));
    } else {
      setData((prev: any) => {
        if (!prev?.sections) return prev;
        return {
          ...prev,
          sections: prev.sections.map((sec: any) => ({
            ...sec,
            items: (sec.items || []).map((it: any) => (it.id === eventId ? { ...it, tags: (it.tags || []).filter((x: string) => x !== t) } : it)),
          })),
        };
      });
    }

    pushToast('info', `Removed tag “${t}”`);

    // reconcile from server (also updates filtering)
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

  function addColumn() {
    if (!board) return;
    const current = board.config.columns ?? board.config.sections ?? [];
    const next: BoardConfigV1 = {
      ...board.config,
      columns: [
        ...current,
        {
          id: `col:${uid()}`,
          title: 'new',
          query: { tagsAny: [], tagsMatch: 'any', includeDone: false, limit: 50 },
          render: { type: 'list' },
        },
      ],
    };
    setBoard({ ...board, config: next });
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  function removeColumn(sectionId: string) {
    if (!board) return;
    const current = board.config.columns ?? board.config.sections ?? [];
    const next: BoardConfigV1 = {
      ...board.config,
      columns: current.filter((s) => s.id !== sectionId),
    };
    setBoard({ ...board, config: next });
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  function setColumnQuery(sectionId: string, patch: Partial<(NonNullable<BoardConfigV1['columns']>[number])['query']>) {
    if (!board) return;
    const current = board.config.columns ?? board.config.sections ?? [];
    const next: BoardConfigV1 = {
      ...board.config,
      columns: current.map((s) => (s.id === sectionId ? { ...s, query: { ...(s.query || {}), ...patch } } : s)),
    };
    setBoard({ ...board, config: next });
    saveBoardConfig(next).catch((e) => setError(String(e)));
  }

  function addTagToColumn(sectionId: string, tag: string) {
    if (!board) return;
    const t = tag.trim().toLowerCase();
    if (!t) return;
    const cur = (board.config.columns ?? board.config.sections ?? []).find((s) => s.id === sectionId)?.query?.tagsAny || [];
    const nextTags = Array.from(new Set([...cur, t]));
    setColumnQuery(sectionId, { tagsAny: nextTags });
  }

  function removeTagFromColumn(sectionId: string, tag: string) {
    if (!board) return;
    const cur = (board.config.columns ?? board.config.sections ?? []).find((s) => s.id === sectionId)?.query?.tagsAny || [];
    const nextTags = cur.filter((x) => x !== tag);
    setColumnQuery(sectionId, { tagsAny: nextTags });
  }

  useEffect(() => {
    fetchBoardAndTags().catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

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

  useEffect(() => {
    if (!board) return;
    if (board.name.toLowerCase() === 'all') {
      setFeedItems([]);
      setFeedCursor(null);
      loadFeedPage(true).catch((e) => setError(String(e)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDoneAll]);

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

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <Link href="/">← All boards</Link>
        {isAll ? (
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#444' }}>
            <input type="checkbox" checked={showDoneAll} onChange={(e) => setShowDoneAll(e.target.checked)} />
            Show done
          </label>
        ) : (
          <button onClick={addColumn}>+ Column</button>
        )}
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
            <button
              onClick={() =>
                bulkAddTag('done')
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
            >
              Mark done
            </button>
            <button
              onClick={() =>
                bulkRemoveTag('done')
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
            >
              Mark not done
            </button>
            <button
              onClick={() =>
                bulkDelete()
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
            >
              Delete
            </button>
            <button
              onClick={() =>
                bulkRestore()
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
            >
              Restore
            </button>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#444' }}>Add tag</span>
              <input value={bulkAddTagValue} onChange={(e) => setBulkAddTagValue(e.target.value)} style={{ padding: 6, minWidth: 140 }} placeholder="tag" />
              <button
                onClick={() => {
                  const t = bulkAddTagValue.trim().toLowerCase();
                  if (!t) return;
                  bulkAddTag(t)
                    .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                    .catch((e) => setError(String(e)));
                  setBulkAddTagValue('');
                }}
              >
                Apply
              </button>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#444' }}>Remove tag</span>
              <input value={bulkRemoveTagValue} onChange={(e) => setBulkRemoveTagValue(e.target.value)} style={{ padding: 6, minWidth: 140 }} placeholder="tag" />
              <button
                onClick={() => {
                  const t = bulkRemoveTagValue.trim().toLowerCase();
                  if (!t) return;
                  bulkRemoveTag(t)
                    .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                    .catch((e) => setError(String(e)));
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

      {isAll ? (
        <div>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 10 }}>Reverse chronological feed. Scroll to load more.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feedItems.map((it) => {
              const isSelected = !!selected[it.id];
              return (
                <div key={it.id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <input type="checkbox" checked={isSelected} onChange={(e) => setSelected((prev) => ({ ...prev, [it.id]: e.target.checked }))} style={{ marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      {editingId === it.id ? (
                        <>
                          <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button
                              onClick={() =>
                                saveContent(it.id, editingText)
                                  .then(() => loadFeedPage(true))
                                  .catch((e) => setError(String(e)))
                              }
                            >
                              Save
                            </button>
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

                      <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{new Date(it.occurredAt).toLocaleString()} • {it.tags.join(', ') || '(no tags)'}</div>

                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {it.tags.map((tg) => (
                          <span
                            key={tg}
                            style={{ fontSize: 12, border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 999, padding: '2px 8px', cursor: 'pointer' }}
                            title="Click to remove tag"
                            onClick={() => removeTagFromEvent(it.id, tg).then(() => loadFeedPage(true)).catch((e) => setError(String(e)))}
                          >
                            {tg} ×
                          </span>
                        ))}
                      </div>

                      <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#444' }}>Add tag</span>
                        <input value={tagDrafts[it.id] || ''} onChange={(e) => setTagDrafts((m) => ({ ...m, [it.id]: e.target.value }))} style={{ padding: 6, minWidth: 160 }} placeholder="type tag" />
                        <button
                          onClick={() => {
                            const val = (tagDrafts[it.id] || '').trim().toLowerCase();
                            if (!val) return;
                            addTagToEvent(it.id, val)
                              .then(() => loadFeedPage(true))
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
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {(data?.sections || []).map((s: any) => {
            const sectionCfg = (board.config.columns ?? board.config.sections ?? []).find((x) => x.id === s.id);
            const columnTags: string[] = (sectionCfg?.query?.tagsAny || []).slice();
            const tagsMatch: 'any' | 'all' = (sectionCfg?.query?.tagsMatch || 'any') as any;
            const includeDone = !!sectionCfg?.query?.includeDone;

            return (
              <div key={s.id} className="col" style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                  <div style={{ fontWeight: 700 }}>Column</div>
                  <button onClick={() => removeColumn(s.id)} style={{ background: '#b91c1c', color: 'white', padding: '4px 10px' }}>
                    Remove
                  </button>
                </div>

                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {columnTags.length ? (
                    columnTags.map((tg) => (
                      <span
                        key={tg}
                        style={{ fontSize: 12, border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 999, padding: '2px 8px', cursor: 'pointer' }}
                        title="Remove tag from column"
                        onClick={() => removeTagFromColumn(s.id, tg)}
                      >
                        {tg} ×
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#666', fontSize: 12 }}>(no tags — column will show everything)</span>
                  )}
                </div>

                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#444' }}>Add tag</span>
                  <input
                    value={colTagDrafts[s.id] || ''}
                    onChange={(e) => setColTagDrafts((m) => ({ ...m, [s.id]: e.target.value }))}
                    style={{ padding: 6, minWidth: 160 }}
                    placeholder="type tag"
                  />
                  <button
                    onClick={() => {
                      const val = (colTagDrafts[s.id] || '').trim().toLowerCase();
                      if (!val) return;
                      setColTagDrafts((m) => ({ ...m, [s.id]: '' }));
                      addTagToColumn(s.id, val);
                    }}
                  >
                    Add
                  </button>

                  <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#444' }}>
                    <input
                      type="checkbox"
                      checked={tagsMatch === 'all'}
                      onChange={(e) => setColumnQuery(s.id, { tagsMatch: e.target.checked ? 'all' : 'any' })}
                    />
                    Require ALL
                  </label>

                  <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#444' }}>
                    <input type="checkbox" checked={includeDone} onChange={(e) => setColumnQuery(s.id, { includeDone: e.target.checked })} />
                    Show done
                  </label>
                </div>

                <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                  {s.items.length} shown{!includeDone && s.hiddenDoneCount ? ` • ${s.hiddenDoneCount} hidden(done)` : ''}
                </div>

                <ul style={{ paddingLeft: 18, marginTop: 10 }}>
                  {s.items.slice(0, 50).map((it: any) => {
                    const isSelected = !!selected[it.id];
                    return (
                      <li key={it.id} style={{ margin: '10px 0' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <input type="checkbox" checked={isSelected} onChange={(e) => setSelected((prev) => ({ ...prev, [it.id]: e.target.checked }))} style={{ marginTop: 4 }} />

                          <div style={{ flex: 1 }}>
                            {editingId === it.id ? (
                              <>
                                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />
                                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                  <button
                                    onClick={() =>
                                      saveContent(it.id, editingText)
                                        .then(() => runBoard())
                                        .catch((e) => setError(String(e)))
                                    }
                                  >
                                    Save
                                  </button>
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
                              {it.pinned ? ' • pinned' : ''}
                            </div>

                            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {(it.tags || []).map((tg: string) => (
                                <span
                                  key={tg}
                                  style={{ fontSize: 12, border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 999, padding: '2px 8px', cursor: 'pointer' }}
                                  title="Click to remove tag"
                                  onClick={() => removeTagFromEvent(it.id, tg).then(() => runBoard()).catch((e) => setError(String(e)))}
                                >
                                  {tg} ×
                                </span>
                              ))}
                            </div>

                            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 12, color: '#444' }}>Add tag</span>
                              <input value={tagDrafts[it.id] || ''} onChange={(e) => setTagDrafts((m) => ({ ...m, [it.id]: e.target.value }))} style={{ padding: 6, minWidth: 160 }} placeholder="type tag" />
                              <button
                                onClick={() => {
                                  const val = (tagDrafts[it.id] || '').trim().toLowerCase();
                                  if (!val) return;
                                  addTagToEvent(it.id, val)
                                    .then(() => runBoard())
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
      )}
    </div>
  );
}
