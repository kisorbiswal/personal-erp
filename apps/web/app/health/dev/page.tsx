'use client';

import { useEffect, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  definition: unknown;
};

export default function DevPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selected, setSelected] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/health/reports/templates`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load templates: ${res.status}`);
      setTemplates(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(template: ReportTemplate) {
    if (selected?.id === template.id) {
      setSelected(null);
      return;
    }
    try {
      const res = await fetch(`${BASE}/health/reports/templates/${template.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);
      setSelected(await res.json());
    } catch {
      // Fall back to list data if single-template endpoint unavailable
      setSelected(template);
    }
  }

  function handleCopy() {
    if (!selected) return;
    const json = JSON.stringify(selected.definition ?? selected, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const prettyJson = selected
    ? JSON.stringify(selected.definition ?? selected, null, 2)
    : '';

  if (loading) return <p style={{ color: '#6b7280' }}>Loading templates…</p>;
  if (error) return (
    <div>
      <p style={{ color: '#dc2626' }}>Error: {error}</p>
      <button className="tab" onClick={loadTemplates} style={{ cursor: 'pointer' }}>Retry</button>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
      {/* Template list */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 13, background: '#f9fafb' }}>
          Templates
        </div>
        {templates.length === 0 ? (
          <p style={{ padding: '12px 14px', color: '#6b7280', fontSize: 13 }}>No templates found.</p>
        ) : (
          templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                background: selected?.id === t.id ? '#eff6ff' : 'white',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>v{t.version} · {t.author}</div>
            </button>
          ))
        )}
      </div>

      {/* JSON viewer */}
      <div>
        {selected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.description}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="tab" onClick={handleCopy} style={{ cursor: 'pointer' }}>
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  className="tab"
                  style={{ cursor: 'not-allowed', opacity: 0.5 }}
                  title="Fork & edit coming in a future phase"
                  disabled
                >
                  Fork & edit
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={prettyJson}
              style={{
                width: '100%',
                minHeight: 480,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: 12,
                background: '#f9fafb',
                color: '#111',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
              Read-only view. Fork &amp; edit flow coming in a future phase.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9ca3af', fontSize: 14, border: '1px dashed #e5e7eb', borderRadius: 8 }}>
            Select a template to view its JSON definition
          </div>
        )}
      </div>
    </div>
  );
}
