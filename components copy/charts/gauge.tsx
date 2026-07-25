"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";

import { cn } from "@/lib/utils";
import { statusToTone } from "@/lib/format";

const TONE_HEX: Record<string, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--muted)",
};

/**
 * Semi-circular gauge for a single 0-100 score (health, risk, safe score).
 * `tone` picks the color by state, not by series — this is a status
 * encoding, so it intentionally does not use the categorical chart palette.
 */
export function Gauge({
  value,
  size = 120,
  label,
  toneOverride,
  className,
}: {
  value: number;
  size?: number;
  label?: string;
  toneOverride?: "success" | "warning" | "danger" | "muted";
  className?: string;
}) {
  const tone = toneOverride ?? statusToTone(value >= 70 ? "HEALTHY" : value >= 40 ? "WARNING" : "CRITICAL");
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("relative flex flex-col items-center", className)} style={{ width: size }}>
      <RadialBarChart
        width={size}
        height={size * 0.62}
        cx="50%"
        cy="100%"
        innerRadius={size * 0.34}
        outerRadius={size * 0.46}
        startAngle={180}
        endAngle={0}
        data={[{ value: clamped }]}
        barSize={size * 0.11}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar
          dataKey="value"
          background={{ fill: "var(--muted-surface)" }}
          fill={TONE_HEX[tone]}
          cornerRadius={999}
          isAnimationActive
        />
      </RadialBarChart>
      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-2xl font-semibold tabular-nums text-foreground">
          {Math.round(clamped)}
        </span>
        {label && <span className="text-[11px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
