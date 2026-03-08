'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
        <a
          href="/boards"
          style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13, marginRight: 8 }}
        >
          ← Boards
        </a>
        {[
          { href: '/health/sources', label: 'Sources' },
          { href: '/health/dashboard', label: 'Dashboard' },
          { href: '/health/dev', label: 'Dev' },
        ].map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={active ? 'tab tabActive' : 'tab'}
              style={{ textDecoration: 'none' }}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
