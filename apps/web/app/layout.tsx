import { BUILD_INFO } from './build-info';
import { BuildGuard } from './BuildGuard';
import { BuildFooter } from './BuildFooter';
import { markdownCss } from './MarkdownContent';

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
            overflow: hidden; /* hard-contain any content that would escape the column */
          }

          /* Simple "tabs" / pill styling */
          .tab {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border: 1px solid #e5e7eb;
            border-radius: 999px;
            background: #f9fafb;
            color: #111;
            font-size: 13px;
            line-height: 1;
          }
          .tab:hover { background: #f3f4f6; }
          .tabActive {
            background: #111827;
            border-color: #111827;
            color: white;
          }
          .tabDanger {
            border-color: #fecaca;
            background: #fef2f2;
            color: #991b1b;
          }

          .chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 2px 8px;
            border: 1px solid #e5e7eb;
            border-radius: 999px;
            background: #f9fafb;
            font-size: 12px;
            line-height: 1.2;
            cursor: pointer;
            user-select: none;
          }
          .chip:hover { background: #f3f4f6; }
          ${markdownCss}
        `}</style>
        <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <a href="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 700 }}>
              Personal ERP
            </a>
            <span style={{ color: '#666' }}>Boards</span>
          </div>

          <a
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/auth/logout`}
            style={{ color: '#666', textDecoration: 'none' }}
          >
            Logout
          </a>
        </div>
        <BuildGuard />
        <div style={{ padding: 16 }}>{children}</div>
        <BuildFooter sha={BUILD_INFO.sha} builtAt={BUILD_INFO.builtAt} deploymentId={String(BUILD_INFO.deploymentId)} />
      </body>
    </html>
  );
}
