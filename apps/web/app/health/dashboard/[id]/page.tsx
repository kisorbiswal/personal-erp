'use client';

import { useEffect, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// ── Types ─────────────────────────────────────────────────────────────────────
type SlotStatus = { resolved: boolean; sourceId?: string; provider?: string };
type ChartData = { labels: string[]; series: Record<string, (number | null)[]> };
type SeriesDef = {
  slot: string; label: string; color: string; type?: string; axis?: string;
  transform?: string; rolling?: number;
};
type ChartDef = {
  id: string; title: string; type: string;
  series?: SeriesDef[];
  xSlot?: string; ySlot?: string; xLabel?: string; yLabel?: string; xTransform?: string;
};
type ReportData = {
  report: { id: string; name: string; description: string; charts: ChartDef[] };
  slots: Record<string, SlotStatus>;
  charts: Record<string, ChartData>;
};

const DATE_RANGES = [
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year',   days: 365 },
  { label: 'All',      days: 0   },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
function transform(value: number | null, t?: string): number | null {
  if (value == null) return null;
  if (t === 'div60') return Math.round((value / 60) * 10) / 10;
  return value;
}

function buildRows(
  chartData: ChartData,
  transforms: Record<string, string | undefined>,
): Array<Record<string, string | number | null>> {
  return chartData.labels.map((date, i) => {
    const row: Record<string, string | number | null> = { date };
    for (const [slot, values] of Object.entries(chartData.series)) {
      row[slot] = transform(values[i] ?? null, transforms[slot]);
    }
    return row;
  });
}

function rollingAvg(data: Array<Record<string, any>>, key: string, window: number): (number | null)[] {
  return data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1);
    const vals = slice.map(d => d[key]).filter((v): v is number => v != null);
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10) / 10;
  });
}

function linearRegression(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 3) return null;
  const sx = pts.reduce((s, p) => s + p.x, 0);
  const sy = pts.reduce((s, p) => s + p.y, 0);
  const sxy = pts.reduce((s, p) => s + p.x * p.y, 0);
  const sxx = pts.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sxx - sx * sx;
  if (!denom) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const meanY = sy / n;
  const ssTot = pts.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = pts.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

function fmtWeek(v: string) {
  return v.includes('-W') ? v.slice(2) : v.slice(5);
}

// ── SlotBadge ─────────────────────────────────────────────────────────────────
function SlotBadge({ slot, status }: { slot: string; status: SlotStatus }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, marginRight: 6,
      background: status.resolved ? '#dcfce7' : '#fee2e2',
      color: status.resolved ? '#15803d' : '#991b1b',
      border: `1px solid ${status.resolved ? '#bbf7d0' : '#fecaca'}`,
    }}>
      {status.resolved ? '✓' : '✗'} {slot}{status.provider ? ` (${status.provider})` : ''}
    </span>
  );
}

// ── Panel 1: Sleep Quality (bar=duration, line=efficiency) ────────────────────
function SleepQualityPanel({ chartData }: { chartData: ChartData }) {
  const rows = buildRows(chartData, { sleep_duration: 'div60' });
  if (!rows.some(r => r.sleep_duration != null)) {
    return <p style={{ color: '#6b7280', fontSize: 13 }}>No sleep data for this period.</p>;
  }
  const barColor = (v: number | null) => v == null ? '#e5e7eb' : v >= 7 ? '#16a34a' : v >= 6 ? '#f59e0b' : '#dc2626';

  return (
    <div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
        🟢 ≥ 7h &nbsp;·&nbsp; 🟡 6–7h &nbsp;·&nbsp; 🔴 &lt; 6h
        &nbsp;&nbsp;—&nbsp; right axis: sleep efficiency %
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={rows} margin={{ top: 4, right: 44, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={fmtWeek} />
          <YAxis yAxisId="left" domain={[0, 10]} tick={{ fontSize: 10 }}
            label={{ value: 'h', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fontSize: 10 }}
            label={{ value: '%', angle: 90, position: 'insideRight', fontSize: 10 }} />
          <Tooltip formatter={(v: unknown, name: string) =>
            name === 'sleep_duration' ? [`${v}h`, 'Avg sleep'] : [`${v}%`, 'Efficiency']
          } />
          <Legend formatter={(v: string) => v === 'sleep_duration' ? 'Sleep (h)' : 'Efficiency %'} />
          <Bar yAxisId="left" dataKey="sleep_duration" name="sleep_duration" maxBarSize={20}>
            {rows.map((r, i) => <Cell key={i} fill={barColor(r.sleep_duration as number | null)} />)}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="sleep_efficiency"
            name="sleep_efficiency" stroke="#10b981" dot={false} connectNulls strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Panel 2: Weight trend + 4-week rolling average ────────────────────────────
function WeightTrendPanel({ chartData }: { chartData: ChartData }) {
  const rows = buildRows(chartData, {});
  if (!rows.some(r => r.weight != null)) {
    return (
      <div style={{ color: '#6b7280', fontSize: 13 }}>
        <p>No weight data in this period.</p>
        <p style={{ fontSize: 12 }}>
          Your Fitbit weight logs cover <b>Apr 2024 – Apr 2025</b>.
          Switch to "1 year" or "All" to see them.
        </p>
      </div>
    );
  }
  const rolling = rollingAvg(rows, 'weight', 4);
  const rowsR = rows.map((r, i) => ({ ...r, weight_rolling: rolling[i] }));

  return (
    <div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
        Bars = weekly average &nbsp;·&nbsp; Line = 4-week rolling average (smooths noise)
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={rowsR} margin={{ top: 4, right: 30, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={fmtWeek} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }}
            label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip formatter={(v: unknown, name: string) =>
            name === 'weight' ? [`${v} kg`, 'Weekly avg'] : [`${v} kg`, '4-week avg']
          } />
          <Legend formatter={(v: string) => v === 'weight' ? 'Weekly avg weight' : '4-week rolling avg'} />
          <Bar dataKey="weight" fill="#fde68a" name="weight" maxBarSize={20} />
          <Line type="monotone" dataKey="weight_rolling" name="weight_rolling"
            stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Panel 3: Sleep vs Weight scatter + linear regression ──────────────────────
function SleepWeightScatterPanel({ chartData }: { chartData: ChartData }) {
  const rows = buildRows(chartData, { sleep_duration: 'div60' });
  const pts = rows
    .filter(r => r.sleep_duration != null && r.weight != null)
    .map(r => ({ x: r.sleep_duration as number, y: r.weight as number, week: r.date as string }));

  if (pts.length < 3) {
    return (
      <p style={{ color: '#6b7280', fontSize: 13 }}>
        Not enough overlapping sleep + weight weeks ({pts.length} found, need ≥ 3).
        Try selecting "All" — weight data is from Apr 2024 – Apr 2025.
      </p>
    );
  }

  const reg = linearRegression(pts);
  const xs = pts.map(p => p.x);
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)];
  const trendPts = reg
    ? [
        { x: Math.round(minX * 10) / 10, y: Math.round((reg.slope * minX + reg.intercept) * 10) / 10 },
        { x: Math.round(maxX * 10) / 10, y: Math.round((reg.slope * maxX + reg.intercept) * 10) / 10 },
      ]
    : [];

  const insight = reg
    ? reg.slope < -0.1
      ? { text: `📉 More sleep → lower weight (good pattern!)`, color: '#16a34a' }
      : reg.slope > 0.1
      ? { text: `📈 More sleep correlates with higher weight this period`, color: '#f59e0b' }
      : { text: `➡ No strong correlation between sleep and weight`, color: '#6b7280' }
    : null;

  return (
    <div>
      {insight && (
        <div style={{ fontSize: 13, fontWeight: 500, color: insight.color, marginBottom: 8 }}>
          {insight.text}
          {reg && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>
            R² = {reg.r2.toFixed(2)} · slope = {reg.slope.toFixed(2)} · {pts.length} weeks
          </span>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 4, right: 30, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" dataKey="x" name="Sleep" tick={{ fontSize: 10 }} domain={['auto', 'auto']}
            label={{ value: 'Avg Sleep (h)', position: 'insideBottom', offset: -14, fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name="Weight" tick={{ fontSize: 10 }} domain={['auto', 'auto']}
            label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <ZAxis range={[50, 50]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
                  <div style={{ color: '#9ca3af', marginBottom: 2 }}>{d?.week}</div>
                  <div>Sleep: <b>{d?.x}h</b></div>
                  <div>Weight: <b>{d?.y} kg</b></div>
                </div>
              );
            }}
          />
          {/* Data points */}
          <Scatter name="Weekly data" data={pts} fill="#6366f1" opacity={0.75} />
          {/* Trend line as 2-point connected scatter */}
          {trendPts.length > 0 && (
            <Scatter name="Trend" data={trendPts} fill="#ef4444" line={{ stroke: '#ef4444', strokeWidth: 2 }} shape={() => null as any} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
        Each dot = one week. Hover for details. Red line = linear trend.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(365);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, days]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const qs = days > 0 ? `?days=${days}` : '';
      const res = await fetch(`${BASE}/health/reports/installed/${params.id}/data${qs}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setData(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading report…</p>;
  if (error) return (
    <div>
      <p style={{ color: '#dc2626' }}>Error: {error}</p>
      <button className="tab" onClick={loadData} style={{ cursor: 'pointer' }}>Retry</button>
    </div>
  );
  if (!data) return null;

  const charts: ChartDef[] = data.report.charts ?? [];
  // All charts share the same merged slot data (all series in one ChartData)
  const allData = data.charts[charts[0]?.id] ?? Object.values(data.charts)[0];

  const panels: Array<{ id: string; title: string; node: React.ReactNode }> = [];
  for (const chart of charts) {
    const cd = data.charts[chart.id] ?? allData;
    if (!cd) continue;
    if (chart.type === 'bar-line-combo')  panels.push({ id: chart.id, title: chart.title, node: <SleepQualityPanel chartData={cd} /> });
    if (chart.type === 'line-rolling')    panels.push({ id: chart.id, title: chart.title, node: <WeightTrendPanel chartData={cd} /> });
    if (chart.type === 'scatter')         panels.push({ id: chart.id, title: chart.title, node: <SleepWeightScatterPanel chartData={cd} /> });
  }

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, marginTop: 0 }}>{data.report.name}</h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12, marginTop: 0 }}>{data.report.description}</p>

      {/* Slot badges */}
      <div style={{ marginBottom: 12 }}>
        {Object.entries(data.slots).map(([slot, status]) => (
          <SlotBadge key={slot} slot={slot} status={status} />
        ))}
      </div>

      {/* Date range */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {DATE_RANGES.map(({ label, days: d }) => (
          <button key={label} className={days === d ? 'tab tabActive' : 'tab'}
            onClick={() => setDays(d)} style={{ cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* 3 panels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {panels.map(p => (
          <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>{p.title}</div>
            {p.node}
          </div>
        ))}
        {panels.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: 13 }}>No panels defined for this report.</p>
        )}
      </div>
    </div>
  );
}
