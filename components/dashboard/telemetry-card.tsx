"use client";

import Link from "next/link";
import { Gauge as GaugeIcon } from "lucide-react";

import { useNodes } from "@/hooks/use-node";
import { useLatestTelemetry } from "@/hooks/use-telemetry";
import { formatPercent, formatTemperature } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/state";

export function TelemetryCard() {
  const { data: nodes, isLoading: loadingNodes } = useNodes();
  const onlineNode = nodes?.find((n) => n.status === "ONLINE");
  const { data: telemetry, isLoading: loadingTelemetry } = useLatestTelemetry(onlineNode?.id);

  const isLoading = loadingNodes || (!!onlineNode && loadingTelemetry);

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GaugeIcon className="size-4 text-chart-1" />
          Live Telemetry
        </CardTitle>
        {onlineNode && (
          <span className="text-xs text-muted-foreground">{onlineNode.hostname}</span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-24 w-full rounded-lg" />}
        {!isLoading && !onlineNode && (
          <EmptyState title="No online nodes" description="Bring a node online to see live telemetry." />
        )}
        {!isLoading && onlineNode && !telemetry && (
          <EmptyState
            title="No telemetry recorded yet"
            description="Publish telemetry to populate live metrics."
          />
        )}
        {telemetry && (
          <div className="grid grid-cols-4 gap-2 text-center">
            <Metric label="CPU" value={formatPercent(telemetry.cpu_usage)} />
            <Metric label="GPU" value={formatPercent(telemetry.gpu_usage)} />
            <Metric label="RAM" value={formatPercent(telemetry.ram_usage)} />
            <Metric label="Temp" value={formatTemperature(telemetry.cpu_temperature)} />
          </div>
        )}
        <Link href="/telemetry" className="mt-3 block text-center text-xs text-primary hover:underline">
          View full telemetry →
        </Link>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 py-2">
      <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
