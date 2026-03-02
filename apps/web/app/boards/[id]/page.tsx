'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BoardPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    fetch(`${base}/boards/${params.id}/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      credentials: 'include',
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [params.id]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link href="/">← All boards</Link>
      </div>

      <h1 style={{ marginTop: 0 }}>{data.board.name}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {data.sections.map((s: any) => (
          <div key={s.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ margin: 0 }}>{s.title}</h3>
              <span style={{ color: '#666', fontSize: 12 }}>{s.items.length}</span>
            </div>

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
        ))}
      </div>
    </div>
  );
}
