'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

function normalizeContent(raw: string): string {
  return raw
    // literal \n → real newline
    .replace(/\\n/g, '\n')
    // lone backslash lines (used as section dividers) → hr
    .replace(/^\s*\\\s*$/gm, '\n---\n');
}

export function MarkdownContent({ content }: Props) {
  return (
    <div className="md-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeContent(content)}</ReactMarkdown>
    </div>
  );
}

// Inline styles injected once via layout — added to layout.tsx global styles
export const markdownCss = `
  .md-content { font-size: 14px; line-height: 1.6; color: #111; overflow-wrap: anywhere; word-break: break-word; min-width: 0; overflow: hidden; }
  .md-content a { word-break: break-all; overflow-wrap: anywhere; }
  .md-content p { margin: 0 0 6px; }
  .md-content p:last-child { margin-bottom: 0; }
  .md-content ul, .md-content ol { margin: 4px 0 6px 18px; padding: 0; }
  .md-content li { margin: 2px 0; }
  .md-content h1, .md-content h2, .md-content h3 { margin: 8px 0 4px; font-size: 14px; font-weight: 600; }
  .md-content code { background: #f3f4f6; border-radius: 4px; padding: 1px 5px; font-size: 12px; font-family: ui-monospace, monospace; }
  .md-content pre { background: #f3f4f6; border-radius: 6px; padding: 10px; overflow-x: auto; margin: 6px 0; }
  .md-content pre code { background: none; padding: 0; }
  .md-content blockquote { border-left: 3px solid #d1d5db; margin: 4px 0; padding-left: 10px; color: #666; }
  .md-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
  .md-content a { color: #6366f1; text-decoration: underline; }
  .md-content strong { font-weight: 600; }
  .md-content table { border-collapse: collapse; width: 100%; font-size: 13px; margin: 6px 0; }
  .md-content th, .md-content td { border: 1px solid #e5e7eb; padding: 4px 8px; text-align: left; }
  .md-content th { background: #f9fafb; font-weight: 600; }
`;
