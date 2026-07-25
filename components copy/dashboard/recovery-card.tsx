"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { useMigrationLogStore } from "@/store/migration-log-store";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status";
import { DataSourceBadge } from "@/components/common/data-source-badge";
import { EmptyState } from "@/components/common/state";

export function RecoveryCard() {
  const latest = useMigrationLogStore((s) => s.entries[0]);
  const recovery = latest?.result.recovery;

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-success" />
          Recovery Status
        </CardTitle>
        {latest && <DataSourceBadge source="session" />}
      </CardHeader>
      <CardContent>
        {!latest && (
          <EmptyState
            title="No recovery actions yet"
            description="Trigger a migration from the Migration Center to see recovery verification here."
          />
        )}
        {latest && recovery && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <StatusBadge status={recovery.status} />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(latest.timestamp)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-border/60 px-2.5 py-2">
                <p className="text-muted-foreground">Checkpoint</p>
                <p className="font-medium text-foreground">
                  {recovery.checkpoint_restored ? "Restored" : "Failed"}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 px-2.5 py-2">
                <p className="text-muted-foreground">Lost steps</p>
                <p className="font-medium text-foreground">{recovery.lost_steps}</p>
              </div>
            </div>
            <Link href="/recovery" className="block text-center text-xs text-primary hover:underline">
              Open Recovery Center →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
