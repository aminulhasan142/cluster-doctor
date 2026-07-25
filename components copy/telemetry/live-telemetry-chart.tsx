"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TelemetrySeriesDef {
  key: string;
  label: string;
  color: string;
  unit?: string;
}

/**
 * Generic single-axis multi-series line chart. Series colors are
 * assigned by the caller using the fixed chart-1..6 categorical order —
 * never cycled, never per-instance random.
 */
export function LiveTelemetryChart({
  data,
  series,
  height = 240,
  yDomain,
}: {
  data: Record<string, number | string>[];
  series: TelemetrySeriesDef[];
  height?: number;
  yDomain?: [number | string, number | string];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          minTickGap={32}
        />
        <YAxis
          domain={yDomain ?? [0, 100]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--muted-foreground)" }}
        />
        {series.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
            iconType="circle"
            iconSize={8}
          />
        )}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
