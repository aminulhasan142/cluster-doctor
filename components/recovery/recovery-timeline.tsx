"use client";

import { useMigrationLogStore } from "@/store/migration-log-store";
import { formatDateTime, formatDuration } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status";
import { DataSourceBadge } from "@/components/common/data-source-badge";
import { EmptyState } from "@/components/common/state";

export function RecoveryTimeline() {
  const entries = useMigrationLogStore((s) => s.entries);
  const withRecovery = entries.filter((e) => e.result.recovery);

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recovery Confirmations</CardTitle>
        <DataSourceBadge source="session" />
      </CardHeader>
      <CardContent className="space-y-3">
        {withRecovery.length === 0 && (
          <EmptyState
            title="No recovery events yet"
            description="Trigger a migration in the Migration Center to generate a recovery confirmation."
          />
        )}
        {withRecovery.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-border/60 p-3.5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                Node #{entry.source_node_id} → Node #{entry.result.plan?.target_node ?? "—"}
              </p>
              <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Field label="Checkpoint" value={entry.result.checkpoint?.checkpoint_restored ? "Restored" : "Failed"} />
              <Field
                label="Restart"
                value={entry.result.recovery?.application_running ? "Successful" : "Unknown"}
              />
              <Field label="Recovery time" value={formatDuration(entry.duration_ms)} />
              <Field label="Lost steps" value={String(entry.result.checkpoint?.lost_steps ?? 0)} />
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <StatusBadge status={entry.result.recovery?.status} />
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{entry.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
