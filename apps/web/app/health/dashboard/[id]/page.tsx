'use client';

import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type SlotStatus = { resolved: boolean; sourceId?: string; provider?: string };

type ChartData = {
  labels: string[];
  series: Record<string, (number | null)[]>;
};

type ReportData = {
  report: {
    id: string;
    name: string;
    description: string;
    charts: Array<{ id: string; title: string; series: Array<{ slot: string; label: string; color: string; unit: string; axis: string }> }>;
  };
  slots: Record<string, SlotStatus>;
  charts: Record<string, ChartData>;
};

const DATE_RANGES = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '180d', days: 180 },
  { label: 'All', days: 0 },
];

function SlotBadge({ slot, status }: { slot: string; status: SlotStatus }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: status.resolved ? '#dcfce7' : '#fee2e2',
        color: status.resolved ? '#15803d' : '#991b1b',
        border: `1px solid ${status.resolved ? '#bbf7d0' : '#fecaca'}`,
        marginRight: 6,
      }}
    >
      {status.resolved ? '✓' : '✗'} {slot}
      {status.provider ? ` (${status.provider})` : ''}
    </span>
  );
}

type SeriesDef = { slot: string; label: string; color: string; unit: string; axis: string; transform?: string };

function applyTransform(value: number | null, transform?: string): number | null {
  if (value == null) return null;
  if (transform === 'div60') return Math.round((value / 60) * 10) / 10;
  return value;
}

function buildChartRows(chartData: ChartData, seriesDefs: SeriesDef[]): Array<Record<string, string | number | null>> {
  const transformMap: Record<string, string | undefined> = {};
  for (const s of seriesDefs) transformMap[s.slot] = s.transform;

  return chartData.labels.map((date, i) => {
    const row: Record<string, string | number | null> = { date };
    for (const [slot, values] of Object.entries(chartData.series)) {
      row[slot] = applyTransform(values[i] ?? null, transformMap[slot]);
    }
    return row;
  });
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(90);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, days]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const qs = days > 0 ? `?days=${days}` : '';
      const res = await fetch(`${BASE}/health/reports/installed/${params.id}/data${qs}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to load report: ${res.status}`);
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

  const firstChart = data.report.charts?.[0];
  const firstChartData = firstChart ? data.charts?.[firstChart.id] : null;
  const chartRows = firstChartData ? buildChartRows(firstChartData, firstChart?.series ?? []) : [];

  // Determine left/right series from template definition
  const leftSeries = firstChart?.series.filter((s) => s.axis === 'left') ?? [];
  const rightSeries = firstChart?.series.filter((s) => s.axis === 'right') ?? [];

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, marginTop: 0 }}>{data.report.name}</h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16, marginTop: 0 }}>{data.report.description}</p>

      {/* Slot resolution badges */}
      <div style={{ marginBottom: 16 }}>
        {Object.entries(data.slots).map(([slot, status]) => (
          <SlotBadge key={slot} slot={slot} status={status} />
        ))}
      </div>

      {/* Date range selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {DATE_RANGES.map(({ label, days: d }) => (
          <button
            key={label}
            className={days === d ? 'tab tabActive' : 'tab'}
            onClick={() => setDays(d)}
            style={{ cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {firstChart && firstChartData ? (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{firstChart.title}</div>
          {chartRows.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: 13 }}>No data available for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartRows} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.startsWith('20') && v.includes('-W') ? v.slice(2) : v.slice(5)}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Sleep (h)', angle: -90, position: 'insideLeft', fontSize: 11, offset: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Weight (kg)', angle: 90, position: 'insideRight', fontSize: 11, offset: 10 }}
                />
                <Tooltip
                  formatter={(value: unknown, name: string) => {
                    const seriesDef = firstChart.series.find((s) => s.slot === name);
                    return [`${value ?? 'N/A'} ${seriesDef?.unit ?? ''}`, seriesDef?.label ?? name];
                  }}
                />
                <Legend formatter={(value: string) => firstChart.series.find((s) => s.slot === value)?.label ?? value} />
                {leftSeries.map((s) => (
                  <Line
                    key={s.slot}
                    yAxisId="left"
                    type="monotone"
                    dataKey={s.slot}
                    stroke={s.color}
                    dot={false}
                    connectNulls
                    name={s.slot}
                  />
                ))}
                {rightSeries.map((s) => (
                  <Line
                    key={s.slot}
                    yAxisId="right"
                    type="monotone"
                    dataKey={s.slot}
                    stroke={s.color}
                    dot={false}
                    connectNulls
                    name={s.slot}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      ) : (
        <p style={{ color: '#6b7280', fontSize: 13 }}>No chart defined for this report.</p>
      )}
    </div>
  );
}
