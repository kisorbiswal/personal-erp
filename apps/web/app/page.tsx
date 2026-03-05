'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type MeResponse = { user: null | { email: string; name?: string | null } };

type BoardItem = { id: string; name: string; updatedAt: string };

type BoardsResponse = { items: BoardItem[] };

async function fetchJsonWithTimeout(url: string, init?: RequestInit, timeoutMs = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...(init || {}),
      credentials: 'include',
      signal: controller.signal,
    });

    if (res.status === 401 || res.status === 403) {
      return { __auth: 'expired' } as any;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${text}`);
    }

    return res.json();
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export default function HomePage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [boards, setBoards] = useState<BoardItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setMe(null);
    setBoards(null);

    try {
      const meJson: any = await fetchJsonWithTimeout(`${base}/auth/me`);
      if (meJson?.__auth === 'expired') {
        setMe({ user: null });
        return;
      }

      setMe(meJson as MeResponse);

      if (!meJson.user) {
        setBoards(null);
        return;
      }

      const bJson = (await fetchJsonWithTimeout(`${base}/boards`)) as BoardsResponse;
      setBoards(bJson.items);
    } catch (e: any) {
      setError(e?.message || String(e));
      setMe({ user: null });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  const landingBoardId = useMemo(() => {
    if (!me?.user) return null;
    if (!boards || boards.length === 0) return null;

    try {
      const landing = localStorage.getItem('landingBoardId');
      if (landing && boards.some((b) => b.id === landing)) return landing;
    } catch {
      // ignore
    }

    return null;
  }, [me?.user, boards]);

  // Behavior:
  // - If landing board is set -> redirect.
  // - Else -> set first board as landing and redirect.
  useEffect(() => {
    if (!me?.user) return;
    if (!boards) return;
    if (boards.length === 0) return;

    if (landingBoardId) {
      router.replace(`/boards/${landingBoardId}`);
      return;
    }

    try {
      localStorage.setItem('landingBoardId', boards[0]!.id);
    } catch {
      // ignore
    }

    router.replace(`/boards/${boards[0]!.id}`);
  }, [boards, landingBoardId, me?.user, router]);

  if (error) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <div style={{ color: '#b91c1c', marginBottom: 12 }}>Error: {error}</div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={`${base}/auth/google`} className="tab" style={{ textDecoration: 'none' }}>
            Sign in with Google
          </a>
          <button className="tab" onClick={load}>
            Retry
          </button>
          <a className="tab" href={`${base}/auth/me`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            Open /auth/me
          </a>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <div>Loading… (checking session)</div>
      </div>
    );
  }

  if (!me.user) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <p>You are not signed in.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={`${base}/auth/google`} className="tab" style={{ textDecoration: 'none' }}>
            Sign in with Google
          </a>
          <button className="tab" onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!boards) return <div>Loading…</div>;

  if (boards.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{ marginTop: 0 }}>Boards</h1>
          <a href={`${base}/auth/logout`} style={{ color: '#666' }}>
            Logout
          </a>
        </div>

        <p>No boards yet.</p>
        <p>Create one from any existing board page UI (or tell me and I’ll add a “Create board” button here too).</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
      <div>Redirecting…</div>
    </div>
  );
}
