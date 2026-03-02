import Link from 'next/link';

async function getBoards() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  const res = await fetch(`${base}/boards`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load boards: ${res.status}`);
  return res.json();
}

export default async function HomePage() {
  const data = await getBoards();
  const items = data.items as Array<{ id: string; name: string; updatedAt: string }>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Boards</h1>
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
