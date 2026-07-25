"use client";

import { ShieldCheck } from "lucide-react";

import { useMigrationLogStore } from "@/store/migration-log-store";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status";
import { EmptyState } from "@/components/common/state";
import type { ClusterNode } from "@/types";

export function RecoveryPanel({ node }: { node: ClusterNode | null }) {
  const entries = useMigrationLogStore((s) => s.entries);

  const relevant = node
    ? entries.find(
        (e) => e.source_node_id === node.id || e.result.plan?.target_node === node.id
      )
    : entries[0];

  return (
    <Card className="glass-panel gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-success" />
          Recovery Confirmation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!relevant && (
          <EmptyState
            title="No recovery activity"
            description={node ? "This node hasn't been part of a migration this session." : "Trigger a migration to see recovery verification here."}
          />
        )}
        {relevant?.result.recovery && (
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <StatusBadge status={relevant.result.recovery.status} />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(relevant.timestamp)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-border/60 py-2">
                <p className="font-medium text-foreground">
                  {relevant.result.checkpoint?.checkpoint_restored ? "Restored" : "Failed"}
                </p>
                <p className="text-muted-foreground">Checkpoint</p>
              </div>
              <div className="rounded-lg border border-border/60 py-2">
                <p className="font-medium text-foreground">
                  {relevant.result.recovery.application_running ? "Running" : "Unknown"}
                </p>
                <p className="text-muted-foreground">Restart</p>
              </div>
              <div className="rounded-lg border border-border/60 py-2">
                <p className="font-medium text-foreground">{relevant.result.recovery.lost_steps}</p>
                <p className="text-muted-foreground">Lost steps</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{relevant.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
