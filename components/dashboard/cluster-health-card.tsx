"use client";

import { Boxes } from "lucide-react";

import { useDashboardOverview } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Gauge } from "@/components/charts/gauge";
import { StatusDonut } from "@/components/charts/status-donut";
import { ErrorState } from "@/components/common/state";

export function ClusterHealthCard() {
  const { data, isLoading, isError, refetch } = useDashboardOverview();

  return (
    <Card className="glass-panel gap-4">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Boxes className="size-4 text-primary" />
          Global Cluster Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-32 w-full rounded-lg" />}
        {isError && <ErrorState message="Could not reach the dashboard API." onRetry={() => refetch()} />}
        {data && (
          <div className="flex items-center gap-4">
            <Gauge value={data.system_health} label="System Health" size={132} />
            <StatusDonut
              size={104}
              data={[
                { key: "healthy", label: "Healthy clusters", value: data.healthy_clusters, tone: "success" },
                { key: "warning", label: "Warning clusters", value: data.warning_clusters, tone: "warning" },
                { key: "critical", label: "Critical clusters", value: data.critical_clusters, tone: "danger" },
              ]}
            />
          </div>
        )}
        {data && (
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
            <div>
              <p className="text-muted-foreground">Total nodes</p>
              <p className="text-base font-semibold text-foreground">{data.nodes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Online / Offline</p>
              <p className="text-base font-semibold text-foreground">
                {data.online_nodes} / {data.offline_nodes}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
