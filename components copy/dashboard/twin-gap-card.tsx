"use client";

import Link from "next/link";
import { ScanEye } from "lucide-react";

import { useNodes } from "@/hooks/use-node";
import { useComputedRealitySummary } from "@/hooks/use-reality";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSourceBadge } from "@/components/common/data-source-badge";
import { EmptyState } from "@/components/common/state";

export function TwinGapCard() {
  const { data: nodes } = useNodes();
  const { data, isLoading } = useComputedRealitySummary(nodes ?? []);

  const total = data ? data.healthy_nodes + data.warning_nodes + data.no_snapshot_nodes : 0;

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ScanEye className="size-4 text-[var(--ai)]" />
          Twin Reality Gap
        </CardTitle>
        <DataSourceBadge source="computed" />
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <Skeleton className="h-20 w-full rounded-lg" />}
        {!isLoading && total === 0 && (
          <EmptyState
            title="No live twin snapshots yet"
            description="Publish telemetry so the Digital Twin has a prediction to compare against."
          />
        )}
        {total > 0 && data && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-success/20 bg-success/5 py-2">
                <p className="text-lg font-semibold text-success tabular-nums">{data.healthy_nodes}</p>
                <p className="text-[11px] text-muted-foreground">Healthy</p>
              </div>
              <div className="rounded-lg border border-warning/20 bg-warning/5 py-2">
                <p className="text-lg font-semibold text-warning tabular-nums">{data.warning_nodes}</p>
                <p className="text-[11px] text-muted-foreground">Gap warning</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/40 py-2">
                <p className="text-lg font-semibold text-muted-foreground tabular-nums">
                  {data.no_snapshot_nodes}
                </p>
                <p className="text-[11px] text-muted-foreground">No twin yet</p>
              </div>
            </div>
            <Link href="/digital-twin" className="block text-center text-xs text-primary hover:underline">
              Inspect in Digital Twin →
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
