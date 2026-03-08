'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type Provider = { provider: string; label: string; connected: boolean; lastSyncAt?: string | null };

type DataSource = {
  id: string;
  provider: string;
  label: string;
  lastSyncAt: string | null;
  syncStatus: string;
  syncError: string | null;
};

type DataPoint = {
  id: string;
  occurredAt: string;
  dataType: string;
  payload: Record<string, unknown>;
};

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'idle' ? '#6b7280' : status === 'syncing' ? '#2563eb' : '#dc2626';
  return (
    <span style={{ color, fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function SourceCard({
  source,
  onSync,
}: {
  source: DataSource;
  onSync: (id: string) => void;
}) {
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [showData, setShowData] = useState(false);

  async function fetchData() {
    if (showData) { setShowData(false); return; }
    setLoadingData(true);
    try {
      const res = await fetch(`${BASE}/health/sources/${source.id}/data`, { credentials: 'include' });
      const json = await res.json();
      setData(json.items ?? json ?? []);
      setShowData(true);
    } catch {
      setData([]);
      setShowData(true);
    } finally {
      setLoadingData(false);
    }
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{source.label}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Provider: {source.provider} &nbsp;·&nbsp; Status: <StatusBadge status={source.syncStatus} />
          </div>
          {source.lastSyncAt && (
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Last sync: {new Date(source.lastSyncAt).toLocaleString()}
            </div>
          )}
          {source.syncError && (
            <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{source.syncError}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="tab"
            onClick={() => onSync(source.id)}
            style={{ cursor: 'pointer' }}
          >
            Sync now
          </button>
          <button
            className="tab"
            onClick={fetchData}
            style={{ cursor: 'pointer' }}
          >
            {loadingData ? 'Loading…' : showData ? 'Hide data' : 'View data'}
          </button>
        </div>
      </div>

      {showData && data && (
        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          {data.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: 13 }}>No data points yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '4px 8px' }}>Date</th>
                  <th style={{ padding: '4px 8px' }}>Type</th>
                  <th style={{ padding: '4px 8px' }}>Payload (excerpt)</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 20).map((dp) => (
                  <tr key={dp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
                      {new Date(dp.occurredAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '4px 8px' }}>{dp.dataType}</td>
                    <td style={{ padding: '4px 8px', color: '#6b7280', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(dp.payload).slice(0, 120)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function SourcesPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [provRes, srcRes] = await Promise.all([
        fetch(`${BASE}/health/sources/providers`, { credentials: 'include', cache: 'no-store' }),
        fetch(`${BASE}/health/sources`, { credentials: 'include', cache: 'no-store' }),
      ]);
      if (!provRes.ok) throw new Error(`Providers fetch failed: ${provRes.status}`);
      if (!srcRes.ok) throw new Error(`Sources fetch failed: ${srcRes.status}`);
      setProviders(await provRes.json());
      setSources(await srcRes.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Re-fetch when returning from OAuth (Fitbit callback adds ?connected=fitbit)
  useEffect(() => {
    if (searchParams.get('connected')) {
      loadAll();
    }
  }, [searchParams, loadAll]);

  async function handleConnect(providerId: string) {
    setConnecting(true);
    try {
      const res = await fetch(`${BASE}/health/sources/${providerId}/connect`, { credentials: 'include' });
      const json = await res.json();
      if (json.authUrl) {
        window.location.href = json.authUrl;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to initiate connect');
    } finally {
      setConnecting(false);
    }
  }

  async function handleSync(sourceId: string) {
    setSyncingId(sourceId);
    try {
      await fetch(`${BASE}/health/sources/${sourceId}/sync`, { method: 'POST', credentials: 'include' });
      await loadAll();
    } catch {
      // ignore
    } finally {
      setSyncingId(null);
    }
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading sources…</p>;
  if (error) return (
    <div>
      <p style={{ color: '#dc2626' }}>Error: {error}</p>
      <button className="tab" onClick={loadAll} style={{ cursor: 'pointer' }}>Retry</button>
    </div>
  );

  const fitbitSource = sources.find((s) => s.provider === 'fitbit');
  const fitbitProvider = providers.find((p) => p.provider === 'fitbit') ?? (fitbitSource ? { provider: 'fitbit', connected: true } : undefined);

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, marginTop: 0 }}>Data Sources</h2>

      {/* Fitbit provider card */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Fitbit</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              Sleep tracking, weight logging
            </div>
            <div style={{ marginTop: 6 }}>
              {fitbitProvider?.connected ? (
                <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500 }}>● Connected</span>
              ) : (
                <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 500 }}>● Not connected</span>
              )}
            </div>
          </div>
          {!fitbitProvider?.connected && (
            <button
              className="tab"
              onClick={() => handleConnect('fitbit')}
              disabled={connecting}
              style={{ cursor: connecting ? 'default' : 'pointer' }}
            >
              {connecting ? 'Redirecting…' : 'Connect Fitbit'}
            </button>
          )}
        </div>
      </div>

      {/* Connected sources */}
      {sources.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Connected sources</h3>
          {sources.map((src) => (
            <SourceCard
              key={src.id}
              source={syncingId === src.id ? { ...src, syncStatus: 'syncing' } : src}
              onSync={handleSync}
            />
          ))}
        </div>
      )}

      {sources.length === 0 && fitbitProvider?.connected && (
        <p style={{ color: '#6b7280', fontSize: 13 }}>Connected but no sources yet — try syncing.</p>
      )}
    </div>
  );
}
