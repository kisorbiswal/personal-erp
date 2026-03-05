'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

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

  const hadLandingAtFirstLoad = useRef<boolean | null>(null);

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
  // - If user already has a landing board set -> redirect immediately.
  // - If not set yet -> show the "all boards" page, but set landing to the first board
  //   so next visit goes straight to a board.
  useEffect(() => {
    if (!me?.user) return;
    if (!boards) return;
    if (boards.length === 0) return;

    if (hadLandingAtFirstLoad.current === null) {
      hadLandingAtFirstLoad.current = Boolean(landingBoardId);
    }

    if (landingBoardId) {
      router.replace(`/boards/${landingBoardId}`);
      return;
    }

    // No landing set: choose the first board as default for next time.
    try {
      localStorage.setItem('landingBoardId', boards[0]!.id);
    } catch {
      // ignore
    }
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

  // Default: show all boards (first-time experience). If a landing board is already set,
  // the useEffect above will redirect immediately.
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Boards</h1>
        <a href={`${base}/auth/logout`} style={{ color: '#666' }}>
          Logout
        </a>
      </div>

      <div style={{ marginTop: 18 }}>
        <ul>
          {boards.map((b) => (
            <li key={b.id} style={{ marginBottom: 8 }}>
              <Link href={`/boards/${b.id}`}>{b.name}</Link>
              <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                updated {new Date(b.updatedAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 14, color: '#666', fontSize: 12 }}>
        Tip: we’ll open your landing board automatically next time.
      </div>
    </div>
  );
}
