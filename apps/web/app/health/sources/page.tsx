'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type Provider = { provider: string; label: string; description?: string; connected: boolean; lastSyncAt?: string | null; authType?: string };

type DataSource = {
  id: string;
  provider: string;
  label: string;
  lastSyncAt: string | null;
  syncStatus: string;
  syncError: string | null;
  dataPointCount?: number;
  syncProgress?: number | null;
};

type DataPoint = {
  id: string;
  occurredAt: string;
  dataType: string;
  payload: Record<string, unknown>;
};

function StatusBadge({ status, progress, hasData }: { status: string; progress?: number | null; hasData?: boolean }) {
  if (status === 'syncing') {
    const label = progress != null ? `Syncing ${progress}%` : 'Syncing…';
    return <span style={{ color: '#2563eb', fontSize: 12, fontWeight: 500 }}>{label}</span>;
  }
  if (status === 'idle' && hasData) {
    return <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 500 }}>✓ Up to date</span>;
  }
  if (status === 'idle') {
    return <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>Idle</span>;
  }
  if (status === 'error') {
    return <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 500 }}>Error</span>;
  }
  return <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>{status}</span>;
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: '#e5e7eb', width: '100%', maxWidth: 200 }}>
      <div style={{ height: 4, borderRadius: 2, background: '#2563eb', width: `${progress}%`, transition: 'width 0.5s ease' }} />
    </div>
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
  const [total, setTotal] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [showData, setShowData] = useState(false);
  const isSyncing = source.syncStatus === 'syncing';

  const doFetchData = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/health/sources/${source.id}/data`, { credentials: 'include' });
      const json = await res.json();
      setData(json.items ?? json ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setData([]);
    }
  }, [source.id]);

  async function fetchData() {
    if (showData) { setShowData(false); return; }
    setLoadingData(true);
    await doFetchData();
    setShowData(true);
    setLoadingData(false);
  }

  // Auto-refresh data table every 5s while syncing and panel is open
  useEffect(() => {
    if (!showData || !isSyncing) return;
    const t = setInterval(doFetchData, 5000);
    return () => clearInterval(t);
  }, [showData, isSyncing, doFetchData]);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{source.label}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Provider: {source.provider} &nbsp;·&nbsp; Status: <StatusBadge status={source.syncStatus} progress={source.syncProgress} hasData={(source.dataPointCount ?? 0) > 0} />
            {source.dataPointCount != null && (
              <span style={{ marginLeft: 8, color: '#9ca3af' }}>{source.dataPointCount.toLocaleString()} records</span>
            )}
          </div>
          {isSyncing && source.syncProgress != null && (
            <ProgressBar progress={source.syncProgress} />
          )}
          {source.lastSyncAt && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: isSyncing ? 4 : 2 }}>
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
            <p style={{ color: '#6b7280', fontSize: 13 }}>{isSyncing ? 'Waiting for first records…' : 'No data points yet.'}</p>
          ) : (
            <>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                Showing latest {data.length} of {total.toLocaleString()} records
                {isSyncing && <span style={{ color: '#2563eb', marginLeft: 6 }}>· live</span>}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '4px 8px' }}>Date</th>
                    <th style={{ padding: '4px 8px' }}>Type</th>
                    <th style={{ padding: '4px 8px' }}>Payload (excerpt)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((dp) => (
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
            </>
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

  // Auto-poll every 3s while any source is actively syncing
  useEffect(() => {
    const isSyncing = sources.some((s) => s.syncStatus === 'syncing');
    if (!isSyncing) return;
    const t = setInterval(loadAll, 3000);
    return () => clearInterval(t);
  }, [sources, loadAll]);

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

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, marginTop: 0 }}>Data Sources</h2>

      {/* Provider cards — dynamic from API */}
      {providers.map((p) => (
        <div key={p.provider} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{p.label}</div>
              {p.description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{p.description}</div>}
              <div style={{ marginTop: 6 }}>
                {p.connected
                  ? <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500 }}>● Connected</span>
                  : <span style={{ color: '#9ca3af', fontSize: 13 }}>● Not connected</span>}
              </div>
            </div>
            {!p.connected && (
              p.authType === 'internal' ? (
                <button className="tab" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={async () => {
                    await fetch(`${BASE}/health/sources/mylogger/connect`, { method: 'POST', credentials: 'include' });
                    loadAll();
                  }}>
                  Connect
                </button>
              ) : (
                <button className="tab" onClick={() => handleConnect(p.provider)}
                  disabled={connecting} style={{ cursor: connecting ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
                  {connecting ? 'Redirecting…' : `Connect ${p.label}`}
                </button>
              )
            )}
          </div>
        </div>
      ))}

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

      {sources.length === 0 && providers.some(p => p.connected) && (
        <p style={{ color: '#6b7280', fontSize: 13 }}>Connected but no sources yet — try syncing.</p>
      )}
    </div>
  );
}
