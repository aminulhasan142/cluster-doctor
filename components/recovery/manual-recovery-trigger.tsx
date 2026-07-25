"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";

import { useNodes } from "@/hooks/use-node";
import {
  useRecoveryHistoryStub,
  useRecoveryStatusStub,
  useTriggerRecoveryStub,
} from "@/hooks/use-recovery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSourceBadge } from "@/components/common/data-source-badge";

export function ManualRecoveryTrigger() {
  const { data: nodes } = useNodes();

  // Always keep Select controlled
  const [nodeId, setNodeId] = useState<string | null>(null);

  const trigger = useTriggerRecoveryStub();

  const { data: status, refetch: refetchStatus } =
    useRecoveryStatusStub(nodeId || undefined);

  const { data: history } =
    useRecoveryHistoryStub(nodeId || undefined);

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Manual Recovery Trigger</CardTitle>
        <DataSourceBadge source="stub" />
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Calls the backend&apos;s <code>/recovery/*</code> router directly.
          These endpoints are currently hardcoded stubs on the server (no
          persistence yet) — useful for demoing the wiring, but the richer
          recovery data above (from an actual migration run) reflects real
          pipeline output.
        </p>

       <Select
  value={nodeId ?? ""}
  onValueChange={(value) => setNodeId(value)}
>
          <SelectTrigger>
            <SelectValue placeholder="Select a node" />
          </SelectTrigger>

          <SelectContent>
            {nodes?.map((n) => (
              <SelectItem
                key={n.id}
                value={String(n.id)}
              >
                {n.hostname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          className="w-full"
          disabled={!nodeId || trigger.isPending}
          onClick={() =>
            nodeId &&
            trigger.mutate(nodeId, {
              onSuccess: () => refetchStatus(),
            })
          }
        >
          <PlayCircle className="size-3.5" />
          Start recovery
        </Button>

        {(status || history) && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs">
            {status && (
              <p>
                Status:{" "}
                <span className="font-medium text-foreground">
                  {status.status}
                </span>
              </p>
            )}

            {history && (
              <p className="text-muted-foreground">
                History entries: {history.history.length} (server does not
                persist history yet)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}