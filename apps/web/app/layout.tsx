import { BUILD_INFO } from './build-info';

export const metadata = {
  title: 'Personal ERP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui', margin: 0 }}>
        <style>{`
          /* Global text wrapping fixes */
          * { box-sizing: border-box; }
          .wrap {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            word-break: break-word;
          }
          .col {
            min-width: 0; /* allows flex/grid children to shrink and wrap */
          }
        `}</style>
        <div style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 700 }}>
            Personal ERP
          </a>
          <span style={{ marginLeft: 12, color: '#666' }}>Boards</span>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
        <div style={{ padding: 12, borderTop: '1px solid #eee', color: '#666', fontSize: 12 }}>
          Build: <code>{BUILD_INFO.sha}</code>
          {BUILD_INFO.builtAt !== 'unknown' ? (
            <>
              {' '}• <span suppressHydrationWarning>{new Date(BUILD_INFO.builtAt).toLocaleString()}</span>
            </>
          ) : (
            <> • <span>time unknown</span></>
          )}
          {' '}• <span style={{ color: '#999' }}>dpl {String(BUILD_INFO.deploymentId).slice(0, 10)}</span>
        </div>
      </body>
    </html>
  );
}
