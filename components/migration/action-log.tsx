"use client";

import { useMigrationLogStore } from "@/store/migration-log-store";
import { formatDateTime, formatDuration } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/common/data-source-badge";
import { StatusBadge } from "@/components/common/status";
import { EmptyState } from "@/components/common/state";

export function ActionLog() {
  const entries = useMigrationLogStore((s) => s.entries);

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>AI Action Log</CardTitle>
        <DataSourceBadge source="session" />
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 && (
          <EmptyState
            title="No actions logged yet"
            description="Every migration you trigger will appear here with its AI explanation."
          />
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-border/60 p-3">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatDuration(entry.duration_ms)}</span>
                <StatusBadge
                  status={entry.result.success ? "COMPLETED" : "FAILED"}
                  label={entry.result.success ? "Success" : "No target"}
                />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{entry.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
