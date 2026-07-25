"use client";

import { useEffect, useRef, useState } from "react";
import { ScanEye } from "lucide-react";

import { useRealityCompare } from "@/hooks/use-reality";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/common/data-source-badge";
import { StatusBadge } from "@/components/common/status";
import { EmptyState } from "@/components/common/state";
import type { ClusterNode, RealityCompareResult } from "@/types";

interface TimelineEntry {
  timestamp: string;
  result: RealityCompareResult;
}

const METRIC_LABELS: Record<string, string> = {
  cpu: "CPU",
  ram: "RAM",
  temperature: "Temperature",
};

export function RealityPanel({ node }: { node: ClusterNode | null }) {
  const { mutate, mutateAsync, data, isPending } = useRealityCompare();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const lastNodeId = useRef<number | null>(null);

  useEffect(() => {
    if (!node) return;
    if (lastNodeId.current === node.id) return;
    lastNodeId.current = node.id;

    mutateAsync({
      nodeId: String(node.id),
      telemetry: {
        cpu: node.cpu_usage,
        memory: node.memory_usage,
        temperature: node.temperature,
      },
    })
      .then((result) => {
        setTimeline((prev) => [{ timestamp: new Date().toISOString(), result }, ...prev].slice(0, 6));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);

  const runNow = () => {
    if (!node) return;
    mutate(
      {
        nodeId: String(node.id),
        telemetry: {
          cpu: node.cpu_usage,
          memory: node.memory_usage,
          temperature: node.temperature,
        },
      },
      {
        onSuccess: (result) => {
          setTimeline((prev) => [{ timestamp: new Date().toISOString(), result }, ...prev].slice(0, 6));
        },
      }
    );
  };

  const result = data ?? timeline[0]?.result;
  const metrics = result?.success
    ? (["cpu", "ram", "temperature"] as const).filter((k) => result[k])
    : [];

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ScanEye className="size-4 text-[var(--ai)]" />
          Twin Reality Check
        </CardTitle>
        <div className="flex items-center gap-2">
          <DataSourceBadge source="live" />
          <Button size="sm" variant="outline" onClick={runNow} disabled={!node || isPending}>
            {isPending ? "Checking…" : "Re-check"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!node && <EmptyState title="Select a node" description="Click a node in the room to inspect it." />}

        {node && result && !result.success && (
          <EmptyState
            title="No twin snapshot yet"
            description={result.message ?? "This node hasn't reported telemetry through the Digital Twin pipeline yet."}
          />
        )}

        {node && result?.success && (
          <>
            <div className="space-y-2">
              {metrics.map((key) => {
                const m = result[key]!;
                return (
                  <div key={key} className="rounded-lg border border-border/60 p-2.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{METRIC_LABELS[key]}</span>
                      <StatusBadge status={m.status === "Healthy" ? "HEALTHY" : "WARNING"} label={m.status} />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      <div>
                        <p className="text-muted-foreground">Predicted</p>
                        <p className="font-medium tabular-nums text-foreground">{m.predicted.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Actual</p>
                        <p className="font-medium tabular-nums text-foreground">{m.actual.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gap</p>
                        <p className="font-medium tabular-nums text-foreground">{m.gap.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-medium tabular-nums text-foreground">{m.accuracy.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {result.average_gap !== undefined && (
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
                <span className="text-muted-foreground">Average reality gap</span>
                <span className="font-semibold text-foreground">{result.average_gap.toFixed(1)}%</span>
                <StatusBadge status={result.status === "Healthy" ? "HEALTHY" : "WARNING"} label={result.status} />
              </div>
            )}

            {timeline.length > 1 && (
              <div className="border-t border-border/60 pt-2">
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Timeline</p>
                <ul className="space-y-1">
                  {timeline.map((entry, i) => (
                    <li key={i} className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{formatRelativeTime(entry.timestamp)}</span>
                      <span>
                        avg gap {entry.result.average_gap?.toFixed(1) ?? "—"}% ·{" "}
                        {entry.result.status ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
