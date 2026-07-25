"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface StatusSlice {
  key: string;
  label: string;
  value: number;
  tone: "success" | "warning" | "danger" | "muted";
}

const TONE_HEX: Record<StatusSlice["tone"], string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--muted)",
};

/** Status-encoded donut (health/severity buckets) — never categorical identity. */
export function StatusDonut({
  data,
  size = 128,
}: {
  data: StatusSlice[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: size, height: size }} className="relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={data.filter((d) => d.value > 0).length > 1 ? 3 : 0}
              startAngle={90}
              endAngle={-270}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.key} fill={TONE_HEX[slice.tone]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums text-foreground">{total}</span>
          <span className="text-[10px] text-muted-foreground">total</span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5">
        {data.map((slice) => (
          <li key={slice.key} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: TONE_HEX[slice.tone] }}
            />
            <span className="flex-1 truncate text-muted-foreground">{slice.label}</span>
            <span className="font-medium tabular-nums text-foreground">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
