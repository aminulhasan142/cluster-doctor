"use client";

import Link from "next/link";
import { Server, Wand2, ShieldAlert } from "lucide-react";

import { useLatestPrediction } from "@/hooks/use-predictions";
import { formatPercent, formatTemperature } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status";
import { UsageBar } from "@/components/node/usage-bar";
import { EmptyState } from "@/components/common/state";
import type { ClusterNode } from "@/types";

export function NodeInspector({ node }: { node: ClusterNode | null }) {
  const { data: prediction } = useLatestPrediction(node?.id);

  const isCritical = prediction && prediction.risk_score >= 75;

  return (
    <Card className="glass-panel gap-3 border border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Server className="size-4 text-primary" />
          Node Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!node && <EmptyState title="No node selected" description="Click a node in the 3D room." />}
        {node && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-foreground">{node.hostname}</p>
                <p className="font-mono text-xs text-muted-foreground">{node.ip_address}</p>
              </div>
              <StatusBadge status={node.status} />
            </div>

            <div className="space-y-2">
              <UsageBar label="CPU" value={node.cpu_usage} />
              <UsageBar label="GPU" value={node.gpu_usage} />
              <UsageBar label="Memory" value={node.memory_usage} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-xl border border-white/5 bg-secondary/30 px-3 py-2">
                <p className="text-muted-foreground text-[10px]">Temperature</p>
                <p className="font-semibold text-foreground">{formatTemperature(node.temperature)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-secondary/30 px-3 py-2">
                <p className="text-muted-foreground text-[10px]">Power Draw</p>
                <p className="font-semibold text-foreground">{node.power_consumption.toFixed(0)}W</p>
              </div>
            </div>

            {prediction && (
              <div
                className={`rounded-xl p-3 text-xs border transition-all ${
                  isCritical
                    ? "border-l-4 border-l-rose-500 border-rose-500/40 bg-rose-950/20 text-rose-200"
                    : "border-white/10 bg-secondary/30 text-foreground"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono font-bold flex items-center gap-1.5">
                    {isCritical && <ShieldAlert className="size-3.5 text-rose-400 animate-pulse" />}
                    {prediction.predicted_label}
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      isCritical ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    Risk {formatPercent(prediction.risk_score, 0)}
                  </span>
                </div>
                {prediction.explanation && (
                  <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                    {prediction.explanation}
                  </p>
                )}
              </div>
            )}

            {prediction && prediction.risk_score >= 50 && (
              <Button
                size="sm"
                className="w-full bg-primary/20 border border-primary/40 hover:bg-primary/30 text-primary font-medium"
                nativeButton={false}
                render={<Link href={`/migration?predictionId=${prediction.id}`} />}
              >
                <Wand2 className="size-3.5 mr-1" />
                Open in Migration Center
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
