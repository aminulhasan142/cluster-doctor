"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface RiskBucket {
  range: string;
  count: number;
  tone: "success" | "warning" | "danger" | "muted";
}

const TONE_HEX: Record<RiskBucket["tone"], string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--muted)",
};

export function bucketPredictionsByRisk(
  predictions: { risk_score: number }[]
): RiskBucket[] {
  const buckets: RiskBucket[] = [
    { range: "0-25", count: 0, tone: "success" },
    { range: "25-50", count: 0, tone: "warning" },
    { range: "50-75", count: 0, tone: "danger" },
    { range: "75-100", count: 0, tone: "danger" },
  ];

  for (const p of predictions) {
    if (p.risk_score < 25) buckets[0].count++;
    else if (p.risk_score < 50) buckets[1].count++;
    else if (p.risk_score < 75) buckets[2].count++;
    else buckets[3].count++;
  }

  return buckets;
}

export function RiskDistributionChart({ data, height = 140 }: { data: RiskBucket[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="28%">
        <XAxis
          dataKey="range"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={24}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.range} fill={TONE_HEX[d.tone]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
