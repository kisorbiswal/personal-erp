'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type InstalledReport = {
  id: string;
  templateId: string;
  createdAt: string;
  template: { id: string; name: string; description: string };
};

type ReportTemplate = {
  id: string;
  name: string;
  description: string;
};

export default function DashboardPage() {
  const [installed, setInstalled] = useState<InstalledReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [showBrowse, setShowBrowse] = useState(false);

  useEffect(() => {
    loadInstalled();
  }, []);

  async function loadInstalled() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/health/reports/installed`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      setInstalled(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load installed reports');
    } finally {
      setLoading(false);
    }
  }

  async function loadTemplates() {
    try {
      const res = await fetch(`${BASE}/health/reports/templates`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load templates: ${res.status}`);
      const all: ReportTemplate[] = await res.json();
      const installedIds = new Set(installed.map((r) => r.templateId));
      setTemplates(all.filter((t) => !installedIds.has(t.id)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load templates');
    }
  }

  async function handleBrowse() {
    if (!showBrowse) {
      await loadTemplates();
      setShowBrowse(true);
    } else {
      setShowBrowse(false);
    }
  }

  async function handleInstall(templateId: string) {
    setInstalling(templateId);
    try {
      const res = await fetch(`${BASE}/health/reports/install`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) throw new Error(`Install failed: ${res.status}`);
      setShowBrowse(false);
      await loadInstalled();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Install failed');
    } finally {
      setInstalling(null);
    }
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading reports…</p>;
  if (error) return (
    <div>
      <p style={{ color: '#dc2626' }}>Error: {error}</p>
      <button className="tab" onClick={loadInstalled} style={{ cursor: 'pointer' }}>Retry</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Dashboard</h2>
        <button className="tab" onClick={handleBrowse} style={{ cursor: 'pointer' }}>
          {showBrowse ? 'Hide templates' : 'Browse templates'}
        </button>
      </div>

      {/* Browse / install templates */}
      {showBrowse && (
        <div style={{ marginBottom: 20, padding: 16, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3 style={{ fontWeight: 600, fontSize: 14, margin: '0 0 12px' }}>Available templates</h3>
          {templates.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: 13 }}>All templates are already installed.</p>
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{t.description}</div>
                </div>
                <button
                  className="tab"
                  onClick={() => handleInstall(t.id)}
                  disabled={installing === t.id}
                  style={{ cursor: installing === t.id ? 'default' : 'pointer' }}
                >
                  {installing === t.id ? 'Installing…' : 'Install'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Installed reports */}
      {installed.length === 0 ? (
        <div style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
          No reports installed yet. Browse templates to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {installed.map((r) => (
            <div
              key={r.id}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{r.template?.name ?? r.templateId}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.template?.description}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  Installed {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link href={`/health/dashboard/${r.id}`} className="tab" style={{ textDecoration: 'none' }}>
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
