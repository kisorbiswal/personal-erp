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
      </body>
    </html>
  );
}
