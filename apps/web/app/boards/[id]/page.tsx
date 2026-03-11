'use client';

import { TabsBar } from '../../TabsBar';
import { MarkdownContent } from '../../MarkdownContent';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TagItem = { id: string; name: string; count: number };

function fmtDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  const Y = d.getFullYear(), M = p(d.getMonth() + 1), D = p(d.getDate());
  const h = d.getHours(), m = p(d.getMinutes()), s = p(d.getSeconds());
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${Y}/${M}/${D}, ${h12}:${m}:${s} ${ampm}`;
}

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
  const [defaultBoardId, setDefaultBoardId] = useState<string | null>(null); // unused, kept for compat
  const [data, setData] = useState<any>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // All board feed
  const [showDoneAll, setShowDoneAll] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll per-column state
  const [colItems, setColItems] = useState<Record<string, any[]>>({});
  const [colCursors, setColCursors] = useState<Record<string, string | null>>({});
  const [colTotalCounts, setColTotalCounts] = useState<Record<string, number | null>>({});
  const [colLoadingMore, setColLoadingMore] = useState<Record<string, boolean>>({});
  // Refs for latest state (used in observer callbacks)
  const colCursorsRef = useRef<Record<string, string | null>>({});
  const colLoadingMoreRef = useRef<Record<string, boolean>>({});
  // Sentinel refs for each column
  const colSentinelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { colCursorsRef.current = colCursors; }, [colCursors]);
  useEffect(() => { colLoadingMoreRef.current = colLoadingMore; }, [colLoadingMore]);

  // selection + bulk
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const [bulkAddTagValue, setBulkAddTagValue] = useState('');
  const [bulkRemoveTagValue, setBulkRemoveTagValue] = useState('done');

  // per-record edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const editAutosaveTimer = useRef<any>(null);
  const lastSavedById = useRef<Record<string, string>>({});

  // per-record tag drafts
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});
  // id of event whose tag input is focused (for suggestion popup)
  const [tagSuggestId, setTagSuggestId] = useState<string | null>(null);

  // per-column tag draft
  const [colTagDrafts, setColTagDrafts] = useState<Record<string, string>>({});

  // column drag-and-drop
  const colDragIdRef = useRef<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  function moveColumn(fromId: string, toId: string) {
    if (!board || fromId === toId) return;
    const current = board.config.columns ?? board.config.sections ?? [];
    const fromIdx = current.findIndex((c) => c.id === fromId);
    const toIdx = current.findIndex((c) => c.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = current.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const nextConfig: BoardConfigV1 = { ...board.config, columns: next };
    setBoard({ ...board, config: nextConfig });
    saveBoardConfig(nextConfig).catch((e) => setError(String(e)));
  }

  // per-column quick capture drafts (auto-create events)
  const [captureDrafts, setCaptureDrafts] = useState<Record<string, string>>({});
  const [captureDates, setCaptureDates] = useState<Record<string, string>>({});  // ISO datetime-local value
  const [captureStatus, setCaptureStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

  function nowLocal() {
    // Returns datetime-local string in local time (yyyy-MM-ddTHH:mm)
    const d = new Date();
    d.setSeconds(0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

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

    // session expired / forbidden — clear auth cache so home page doesn't loop
    if (res.status === 401 || res.status === 403) {
      try { sessionStorage.removeItem('life_auth_user'); localStorage.removeItem('lastBoardId'); } catch {}
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
    // Critical path: board config only — no redundant board list fetch
    const b = await fetchJson(`${base}/boards/${params.id}`);
    setBoard({ id: b.id, name: b.name, config: b.config });

    // Remember last opened board for fast redirect on next visit
    try { localStorage.setItem('lastBoardId', b.id); } catch {}

    // Tags are only needed for autocomplete — load in background after render
    fetchJson(`${base}/tags?limit=2000`)
      .then((tj) => setTags(tj.items || []))
      .catch(() => {});
  }

  async function saveBoardConfig(next: BoardConfigV1) {
    if (!board) return;
    const updated = await fetchJson(`${base}/boards/${board.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ config: next }),
    });
    setBoard({ id: updated.id, name: updated.name, config: updated.config });

    // refresh board results after config changes
    await runBoard();
    pushToast('success', 'Board updated');
  }

  // Export all items from a column as TSV (tab-separated, double-quoted fields)
  async function exportColumn(colId: string, colName: string) {
    const allItems: any[] = [];
    let cursor: string | null = null;

    // Fetch all pages for this column (limit 200 per page)
    do {
      const body: any = { exportColId: colId, cursors: cursor ? { [colId]: cursor } : {} };
      const d = await fetchJson(`${base}/boards/${params.id}/run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const sec = (d.sections || []).find((s: any) => s.id === colId);
      if (!sec) break;
      allItems.push(...(sec.items || []));
      cursor = sec.nextCursor ?? null;
    } while (cursor);

    // Build TSV: tab-separated columns, double-quoted fields, "" escapes internal quotes
    const q = (s: string) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const rows = [
      ['Date', 'Content', 'Tags'].map(q).join('\t'),
      ...allItems.map((it: any) =>
        [fmtDate(it.occurredAt), it.content, (it.tags || []).join(', ')].map(q).join('\t')
      ),
    ];
    const blob = new Blob([rows.join('\r\n')], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${colName.replace(/[^a-z0-9]+/gi, '_')}_${new Date().toISOString().slice(0, 10)}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runBoard() {
    const d = await fetchJson(`${base}/boards/${params.id}/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    setData(d);
    // Initialize per-column items and cursors from fresh response
    const newColItems: Record<string, any[]> = {};
    const newColCursors: Record<string, string | null> = {};
    const newColTotals: Record<string, number | null> = {};
    for (const sec of d.sections || []) {
      newColItems[sec.id] = sec.items || [];
      newColCursors[sec.id] = sec.nextCursor ?? null;
      newColTotals[sec.id] = sec.totalCount ?? null;
    }
    setColItems(newColItems);
    setColCursors(newColCursors);
    setColTotalCounts(newColTotals);
    setColLoadingMore({});
  }

  async function loadMoreForColumn(colId: string, cursor: string) {
    setColLoadingMore((prev) => ({ ...prev, [colId]: true }));
    try {
      const d = await fetchJson(`${base}/boards/${params.id}/run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cursors: { [colId]: cursor } }),
      });
      // Find the section result for this column
      const sec = (d.sections || []).find((s: any) => s.id === colId);
      if (sec) {
        setColItems((prev) => ({ ...prev, [colId]: [...(prev[colId] || []), ...(sec.items || [])] }));
        setColCursors((prev) => ({ ...prev, [colId]: sec.nextCursor ?? null }));
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setColLoadingMore((prev) => ({ ...prev, [colId]: false }));
    }
  }

  // Set up IntersectionObserver for each column's sentinel
  useEffect(() => {
    if (!data?.sections) return;

    const observers: IntersectionObserver[] = [];

    for (const sec of data.sections) {
      const sentinel = colSentinelRefs.current[sec.id];
      if (!sentinel) continue;

      const colId = sec.id;
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const cursor = colCursorsRef.current[colId];
              const loading = colLoadingMoreRef.current[colId];
              if (cursor && !loading) {
                loadMoreForColumn(colId, cursor);
              }
            }
          }
        },
        { threshold: 0 },
      );

      observer.observe(sentinel);
      observers.push(observer);
    }

    return () => {
      for (const obs of observers) obs.disconnect();
    };
    // Re-run when sections change (new columns added/removed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.sections?.map((s: any) => s.id).join(',')]);

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
    pushToast('success', `Added tag "${t}" to ${selectedIds.length} items`);
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
    pushToast('success', `Removed tag "${t}" from ${selectedIds.length} items`);
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

  async function bulkHardDelete() {
    if (!selectedIds.length) return;
    if (!confirm(`⚠️ PERMANENTLY delete ${selectedIds.length} items? This cannot be undone.`)) return;
    if (!confirm(`Are you sure? ${selectedIds.length} items will be gone forever (compliance hard delete).`)) return;
    const res = await fetch(`${base}/events/bulk/hard-delete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventIds: selectedIds }),
    });
    if (!res.ok) throw new Error(`Hard delete failed: HTTP ${res.status}`);
    pushToast('success', `Permanently deleted ${selectedIds.length} items`);
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
    setColItems((prev) => {
      const next = { ...prev };
      for (const colId of Object.keys(next)) {
        next[colId] = (next[colId] || []).map((it) =>
          it.id === eventId ? { ...it, tags: Array.from(new Set([...(it.tags || []), t])) } : it,
        );
      }
      return next;
    });

    pushToast('success', `Added tag "${t}"`);

    // reconcile from server (also updates filtering)
    await runBoard();
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
    setColItems((prev) => {
      const next = { ...prev };
      for (const colId of Object.keys(next)) {
        next[colId] = (next[colId] || []).map((it) =>
          it.id === eventId ? { ...it, tags: (it.tags || []).filter((x: string) => x !== t) } : it,
        );
      }
      return next;
    });

    pushToast('info', `Removed tag "${t}"`);

    // reconcile from server (also updates filtering)
    await runBoard();
  }

  async function saveContent(eventId: string, content: string, opts?: { silent?: boolean; keepEditing?: boolean }) {
    const res = await fetch(`${base}/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(`Save content failed: HTTP ${res.status}`);

    lastSavedById.current[eventId] = content;

    if (!opts?.keepEditing) {
      setEditingId(null);
      setEditingText('');
    }

    if (!opts?.silent) {
      pushToast('success', 'Saved');
    }

    await runBoard();
  }

  async function createEvent(content: string, tags: string[], occurredAt?: string) {
    const res = await fetch(`${base}/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content, tags, ...(occurredAt ? { occurredAt: new Date(occurredAt).toISOString() } : {}) }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Create event failed: HTTP ${res.status} ${text}`);
    }
    return res.json();
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
    runBoard().catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.id]);

  // Autosave edited event text after short pause.
  useEffect(() => {
    if (!editingId) return;

    if (editAutosaveTimer.current) clearTimeout(editAutosaveTimer.current);

    editAutosaveTimer.current = setTimeout(() => {
      const next = (editingText || '').trim();
      const prev = (lastSavedById.current[editingId] || '').trim();
      if (!next || next === prev) return;

      saveContent(editingId, editingText, { silent: true, keepEditing: true }).catch((e) => setError(String(e)));
    }, 800);

    return () => {
      if (editAutosaveTimer.current) clearTimeout(editAutosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, editingText]);

  if (error) return <div>Error: {error}</div>;
  if (!board) return <div>Loading...</div>;

  // Treat every board the same ("All" is not special).
  const isAll = false;

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

      <TabsBar activeBoardId={params.id} />

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button className="tab" onClick={addColumn} style={{ cursor: 'pointer' }} title="Add a new column">
          + Column
        </button>
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
              className="tab"
              onClick={() =>
                bulkAddTag('done')
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
            >
              Mark done
            </button>
            <button
              className="tab"
              onClick={() =>
                bulkRemoveTag('done')
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
            >
              Mark not done
            </button>
            <button
              className="tab tabDanger"
              onClick={() =>
                bulkDelete()
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
            >
              Delete
            </button>
            <button
              className="tab tabDanger"
              onClick={() =>
                bulkHardDelete()
                  .then(() => (isAll ? loadFeedPage(true) : runBoard()))
                  .catch((e) => setError(String(e)))
              }
              title="Permanently delete — cannot be undone"
              style={{ borderColor: '#dc2626', background: '#7f1d1d', color: 'white' }}
            >
              Hard Delete ☠️
            </button>
            <button
              className="tab"
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
              <button className="tab"
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
              <button className="tab"
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

            <button className="tab" onClick={clearSelection}>
              Clear
            </button>
          </div>
        </div>
      ) : null}


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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingId === it.id ? (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  e.preventDefault();
                                  if (editAutosaveTimer.current) clearTimeout(editAutosaveTimer.current);
                                  const next = editingText.trim();
                                  const prev = (lastSavedById.current[it.id] || '').trim();
                                  if (next && next !== prev) {
                                    saveContent(it.id, editingText, { silent: true })
                                      .then(() => loadFeedPage(true))
                                      .catch((e) => setError(String(e)));
                                  } else {
                                    setEditingId(null);
                                    setEditingText('');
                                  }
                                }
                              }}
                              rows={8}
                              style={{ width: '100%', padding: 8, fontFamily: 'ui-monospace, monospace', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db', resize: 'vertical' }}
                              placeholder="Markdown supported… (Esc to save & close)"
                            />
                            <div style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fafafa', overflowY: 'auto', maxHeight: 240 }}>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Preview</div>
                              <MarkdownContent content={editingText || '_preview_'} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button className="tab"
                              onClick={() =>
                                saveContent(it.id, editingText)
                                  .then(() => loadFeedPage(true))
                                  .catch((e) => setError(String(e)))
                              }
                            >
                              Save
                            </button>
                            <button className="tab"
                              onClick={() => {
                                if (editAutosaveTimer.current) clearTimeout(editAutosaveTimer.current);
                                const next = editingText.trim();
                                const prev = (lastSavedById.current[it.id] || '').trim();
                                if (next && next !== prev) {
                                  saveContent(it.id, editingText, { silent: true })
                                    .then(() => loadFeedPage(true))
                                    .catch((e) => setError(String(e)));
                                } else {
                                  setEditingId(null);
                                  setEditingText('');
                                }
                              }}
                            >
                              Close
                            </button>
                          </div>
                        </>
                      ) : (
                        <MarkdownContent content={it.content} />
                      )}

                      <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{fmtDate(it.occurredAt)} • {it.tags.join(', ') || '(no tags)'}</div>

                      <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {it.tags.map((tg) => (
                          <span
                            key={tg}
                            className="chip"
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
                        <button className="tab"
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
                        <button className="tab"
                          onClick={() => {
                            setEditingId(it.id);
                            setEditingText(it.content);
                            lastSavedById.current[it.id] = it.content;
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

            // Use per-column accumulated items (falls back to section items on first load)
            const visibleItems = colItems[s.id] ?? s.items ?? [];
            const visibleIds = visibleItems.map((it: any) => it.id);
            const allSelectedInColumn = visibleIds.length > 0 && visibleIds.every((id: string) => !!selected[id]);
            const hasMore = !!colCursors[s.id];
            const isLoadingMore = !!colLoadingMore[s.id];

            const isDragOver = dragOverColId === s.id && colDragIdRef.current !== s.id;

            return (
              <div
                key={s.id}
                className="col"
                style={{
                  border: isDragOver ? '2px dashed #6366f1' : '1px solid #eee',
                  borderRadius: 10,
                  padding: 12,
                  transition: 'border 0.15s',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverColId(s.id); }}
                onDragLeave={() => setDragOverColId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = colDragIdRef.current;
                  colDragIdRef.current = null;
                  setDragOverColId(null);
                  if (from) moveColumn(from, s.id);
                }}
              >
                {/* ── Column header (drag handle only) ── */}
                <div
                  draggable
                  onDragStart={(e) => {
                    colDragIdRef.current = s.id;
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => { colDragIdRef.current = null; setDragOverColId(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 6px',
                    marginBottom: 8,
                    borderRadius: 6,
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    cursor: 'grab',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ color: '#9ca3af', fontSize: 14, letterSpacing: 1, flex: 1 }}>⠿</span>

                  <button
                    onClick={(e) => { e.stopPropagation(); exportColumn(s.id, s.name || s.id); }}
                    title="Export column as TSV"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', color: '#9ca3af', flexShrink: 0 }}
                  >
                    ↓
                  </button>
                  <button
                    className="tab"
                    onClick={(e) => { e.stopPropagation(); addColumn(); }}
                    title="Add column"
                    style={{ padding: '3px 9px', cursor: 'pointer', flexShrink: 0 }}
                  >
                    +
                  </button>
                  <button
                    className="tab tabDanger"
                    onClick={(e) => { e.stopPropagation(); removeColumn(s.id); }}
                    title="Remove column"
                    style={{ padding: '3px 9px', cursor: 'pointer', flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>

                {/* Tags + match radio */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  <label style={{ display: 'flex', gap: 3, alignItems: 'center', fontSize: 11, color: tagsMatch === 'any' ? '#111' : '#999', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="radio" name={`match-${s.id}`} checked={tagsMatch === 'any'} onChange={() => setColumnQuery(s.id, { tagsMatch: 'any' })} />
                    Any
                  </label>
                  <label style={{ display: 'flex', gap: 3, alignItems: 'center', fontSize: 11, color: tagsMatch === 'all' ? '#111' : '#999', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="radio" name={`match-${s.id}`} checked={tagsMatch === 'all'} onChange={() => setColumnQuery(s.id, { tagsMatch: 'all' })} />
                    All
                  </label>
                  <span style={{ color: '#d1d5db', fontSize: 11 }}>|</span>
                  {columnTags.length ? (
                    columnTags.map((tg) => (
                      <span
                        key={tg}
                        className="chip"
                        title="Remove tag from column"
                        onClick={() => removeTagFromColumn(s.id, tg)}
                      >
                        {tg} ×
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#aaa', fontSize: 11 }}>no tags</span>
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
                  <button className="tab"
                    onClick={() => {
                      const val = (colTagDrafts[s.id] || '').trim().toLowerCase();
                      if (!val) return;
                      setColTagDrafts((m) => ({ ...m, [s.id]: '' }));
                      addTagToColumn(s.id, val);
                    }}
                  >
                    Add
                  </button>

                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ color: '#666', fontSize: 12 }}>Quick capture</div>
                    <input
                      type="datetime-local"
                      value={captureDates[s.id] || ''}
                      placeholder={nowLocal()}
                      onChange={(e) => setCaptureDates((m) => ({ ...m, [s.id]: e.target.value }))}
                      style={{ fontSize: 11, color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 6px', background: 'transparent', cursor: 'pointer' }}
                    />
                  </div>
                  <textarea
                    value={captureDrafts[s.id] || ''}
                    onChange={(e) => {
                      setCaptureDrafts((m) => ({ ...m, [s.id]: e.target.value }));
                      setCaptureStatus((m) => ({ ...m, [s.id]: 'idle' }));
                    }}
                    onBlur={() => {
                      const content = (captureDrafts[s.id] || '').trim();
                      if (!content) return;

                      const occurredAt = captureDates[s.id] || undefined;
                      setCaptureStatus((m) => ({ ...m, [s.id]: 'saving' }));
                      createEvent(content, columnTags, occurredAt)
                        .then(() => {
                          setCaptureDrafts((m) => ({ ...m, [s.id]: '' }));
                          setCaptureDates((m) => ({ ...m, [s.id]: '' })); // reset to now
                          setCaptureStatus((m) => ({ ...m, [s.id]: 'saved' }));
                          return runBoard();
                        })
                        .catch((err) => {
                          setCaptureStatus((m) => ({ ...m, [s.id]: 'error' }));
                          setError(String(err));
                        });
                    }}
                    rows={3}
                    placeholder={columnTags.length ? `Auto-tags: ${columnTags.join(', ')}` : 'Write… (no tags selected; will create untagged event)'}
                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }}
                  />
                  <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                    {captureStatus[s.id] === 'saving'
                      ? 'Saving…'
                      : captureStatus[s.id] === 'saved'
                        ? 'Saved'
                        : captureStatus[s.id] === 'error'
                          ? 'Error saving'
                          : 'Saves on blur'}
                  </div>
                </div>

                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#666', fontSize: 12 }}>
                      {colTotalCounts[s.id] != null
                        ? `${visibleItems.length} of ${colTotalCounts[s.id]}`
                        : `${visibleItems.length} shown`}
                      {!includeDone && s.hiddenDoneCount ? ` • ${s.hiddenDoneCount} done hidden` : ''}
                    </span>
                    {(includeDone || s.hiddenDoneCount > 0) && (
                      <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#444' }}>
                        <input type="checkbox" checked={includeDone} onChange={(e) => setColumnQuery(s.id, { includeDone: e.target.checked })} />
                        Show done
                      </label>
                    )}
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#444' }}>
                    <input
                      type="checkbox"
                      checked={allSelectedInColumn}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelected((prev) => {
                          const next = { ...prev } as Record<string, boolean>;
                          for (const id of visibleIds) {
                            next[id] = checked;
                          }
                          return next;
                        });
                      }}
                    />
                    Select all in column
                  </label>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {visibleItems.map((it: any) => {
                    const isSelected = !!selected[it.id];
                    return (
                      <li key={it.id} style={{
                        background: '#fff',
                        border: isSelected ? '1.5px solid #6366f1' : '1px solid #e5e7eb',
                        borderRadius: 10,
                        padding: '10px 12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'border-color 0.1s',
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <input type="checkbox" checked={isSelected} onChange={(e) => setSelected((prev) => ({ ...prev, [it.id]: e.target.checked }))} style={{ marginTop: 3, flexShrink: 0 }} />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Pencil — top-right of card content */}
                            {editingId !== it.id && (
                              <button
                                title="Edit content"
                                onClick={() => {
                                  setEditingId(it.id);
                                  setEditingText(it.content);
                                  lastSavedById.current[it.id] = it.content;
                                }}
                                style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '0 0 4px 6px', color: '#d1d5db', lineHeight: 1 }}
                              >
                                ✏️
                              </button>
                            )}
                            {editingId === it.id ? (
                              <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        e.preventDefault();
                                        if (editAutosaveTimer.current) clearTimeout(editAutosaveTimer.current);
                                        const next = editingText.trim();
                                        const prev = (lastSavedById.current[it.id] || '').trim();
                                        if (next && next !== prev) {
                                          saveContent(it.id, editingText, { silent: true })
                                            .then(() => runBoard())
                                            .catch((e) => setError(String(e)));
                                        } else {
                                          setEditingId(null);
                                          setEditingText('');
                                        }
                                      }
                                    }}
                                    rows={8}
                                    style={{ width: '100%', padding: 8, fontFamily: 'ui-monospace, monospace', fontSize: 13, borderRadius: 6, border: '1px solid #d1d5db', resize: 'vertical' }}
                                    placeholder="Markdown supported… (Esc to save & close)"
                                  />
                                  <div style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fafafa', overflowY: 'auto', maxHeight: 240 }}>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Preview</div>
                                    <MarkdownContent content={editingText || '_preview_'} />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                  <button className="tab"
                                    onClick={() =>
                                      saveContent(it.id, editingText)
                                        .then(() => runBoard())
                                        .catch((e) => setError(String(e)))
                                    }
                                  >
                                    Save
                                  </button>
                                  <button className="tab"
                                    onClick={() => {
                                      if (editAutosaveTimer.current) clearTimeout(editAutosaveTimer.current);
                                      const next = editingText.trim();
                                      const prev = (lastSavedById.current[it.id] || '').trim();
                                      if (next && next !== prev) {
                                        saveContent(it.id, editingText, { silent: true })
                                          .then(() => runBoard())
                                          .catch((e) => setError(String(e)));
                                      } else {
                                        setEditingId(null);
                                        setEditingText('');
                                      }
                                    }}
                                  >
                                    Close
                                  </button>
                                </div>
                              </>
                            ) : (
                              <MarkdownContent content={it.content} />
                            )}

                            <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                              {fmtDate(it.occurredAt)} • {it.tags.join(', ') || '(no tags)'}
                              {it.pinned ? ' • pinned' : ''}
                            </div>

                            {/* Tags + inline add input in one chip row */}
                            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                              {(it.tags || []).map((tg: string) => (
                                <span
                                  key={tg}
                                  className="chip"
                                  title="Click to remove tag"
                                  onClick={() => removeTagFromEvent(it.id, tg).then(() => runBoard()).catch((e) => setError(String(e)))}
                                >
                                  {tg} ×
                                </span>
                              ))}
                              {/* Inline ghost tag input with custom filtered suggestions */}
                              <div style={{ position: 'relative' }}>
                                <input
                                  value={tagDrafts[it.id] || ''}
                                  onChange={(e) => setTagDrafts((m) => ({ ...m, [it.id]: e.target.value }))}
                                  onFocus={() => setTagSuggestId(it.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = (tagDrafts[it.id] || '').trim().toLowerCase();
                                      if (!val) return;
                                      setTagSuggestId(null);
                                      addTagToEvent(it.id, val)
                                        .then(() => runBoard())
                                        .then(() => setTagDrafts((m) => ({ ...m, [it.id]: '' })))
                                        .catch((e) => setError(String(e)));
                                    } else if (e.key === 'Escape') {
                                      setTagSuggestId(null);
                                      setTagDrafts((m) => ({ ...m, [it.id]: '' }));
                                    }
                                  }}
                                  onBlur={() => {
                                    // Delay so suggestion click can fire first
                                    setTimeout(() => {
                                      setTagSuggestId(null);
                                      const val = (tagDrafts[it.id] || '').trim().toLowerCase();
                                      if (!val) return;
                                      addTagToEvent(it.id, val)
                                        .then(() => runBoard())
                                        .then(() => setTagDrafts((m) => ({ ...m, [it.id]: '' })))
                                        .catch((e) => setError(String(e)));
                                    }, 150);
                                  }}
                                  style={{
                                    border: 'none', outline: 'none', background: 'transparent',
                                    fontSize: 12, color: '#6b7280', padding: '2px 0',
                                    width: tagDrafts[it.id] ? `${Math.min((tagDrafts[it.id] || '').length + 3, 20)}ch` : '8ch',
                                    minWidth: '8ch',
                                  }}
                                  placeholder="+ tag"
                                />
                                {/* Suggestion popup — only when focused + query has matches */}
                                {tagSuggestId === it.id && (tagDrafts[it.id] || '').trim().length > 0 && (() => {
                                  const q = (tagDrafts[it.id] || '').toLowerCase();
                                  const matches = tags.filter((t) => t.name.toLowerCase().includes(q) && !(it.tags || []).includes(t.name)).slice(0, 8);
                                  if (matches.length === 0) return null;
                                  return (
                                    <div style={{
                                      position: 'absolute', top: '100%', left: 0, zIndex: 999,
                                      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 140, marginTop: 2,
                                    }}>
                                      {matches.map((t) => (
                                        <div
                                          key={t.id}
                                          onMouseDown={(e) => {
                                            e.preventDefault(); // prevent blur firing first
                                            setTagSuggestId(null);
                                            addTagToEvent(it.id, t.name)
                                              .then(() => runBoard())
                                              .then(() => setTagDrafts((m) => ({ ...m, [it.id]: '' })))
                                              .catch((e) => setError(String(e)));
                                          }}
                                          style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 6 }}
                                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                          {t.name}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Infinite scroll sentinel + loading indicator */}
                <div
                  ref={(el) => { colSentinelRefs.current[s.id] = el; }}
                  data-col-id={s.id}
                  style={{ height: 4, marginTop: 8 }}
                />
                {isLoadingMore && (
                  <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>Loading…</div>
                )}
                {!hasMore && visibleItems.length > 0 && (
                  <div style={{ color: '#bbb', fontSize: 11, textAlign: 'center', padding: '4px 0' }}>— end —</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
