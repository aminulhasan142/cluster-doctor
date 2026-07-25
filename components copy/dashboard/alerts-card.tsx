"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";

import { useCriticalNotifications } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot } from "@/components/common/status";
import { EmptyState } from "@/components/common/state";

export function AlertsCard() {
  const { data, isLoading } = useCriticalNotifications();

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BellRing className="size-4 text-danger" />
          Realtime Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading && <Skeleton className="h-24 w-full rounded-lg" />}
        {!isLoading && (!data || data.length === 0) && (
          <EmptyState title="No critical alerts" description="Nothing urgent needs your attention." />
        )}
        {data?.slice(0, 5).map((n) => (
          <div key={n.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
            <StatusDot status={n.threat_level} pulse className="mt-1.5" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
              <p className="truncate text-xs text-muted-foreground">{n.message}</p>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatRelativeTime(n.created_at)}
            </span>
          </div>
        ))}
        {data && data.length > 0 && (
          <Link href="/alerts" className="block pt-1 text-center text-xs text-primary hover:underline">
            View all alerts →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
