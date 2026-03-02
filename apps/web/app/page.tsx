import Link from 'next/link';

async function api(path: string, init?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const res = await fetch(`${base}${path}`, { ...init, cache: 'no-store' });
  return res;
}

export default async function HomePage() {
  const meRes = await api('/auth/me');
  const me = await meRes.json();

  if (!me.user) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Personal ERP</h1>
        <p>You are not signed in.</p>
        <a href={`${base}/auth/google`} style={{ display: 'inline-block', padding: '10px 14px', border: '1px solid #111', borderRadius: 8 }}>
          Sign in with Google
        </a>
      </div>
    );
  }

  const boardsRes = await api('/boards');
  if (!boardsRes.ok) throw new Error(`Failed to load boards: ${boardsRes.status}`);
  const data = await boardsRes.json();
  const items = data.items as Array<{ id: string; name: string; updatedAt: string }>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ marginTop: 0 }}>Boards</h1>
        <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/auth/logout`} style={{ color: '#666' }}>
          Logout
        </a>
      </div>

      <ul>
        {items.map((b) => (
          <li key={b.id} style={{ marginBottom: 8 }}>
            <Link href={`/boards/${b.id}`}>{b.name}</Link>
            <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
              updated {new Date(b.updatedAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
