"use client";

import { Cpu, Flame, MoreVertical, Server, Zap } from "lucide-react";
import { toast } from "sonner";

import { useNodeMutations } from "@/hooks/use-node";
import { formatTemperature } from "@/lib/format";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/status";
import { UsageBar } from "@/components/node/usage-bar";
import type { ClusterNode } from "@/types";

export function NodeCard({ node }: { node: ClusterNode }) {
  const { updateStatus, remove } = useNodeMutations();

  const setStatus = async (status: ClusterNode["status"]) => {
    try {
      await updateStatus.mutateAsync({ id: node.id, status });
      toast.success(`${node.hostname} set to ${status}`);
    } catch {
      toast.error("Failed to update node status");
    }
  };

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
            <Server className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{node.hostname}</p>
            <p className="text-xs text-muted-foreground">{node.ip_address}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatus("ONLINE")}>Set online</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatus("MAINTENANCE")}>Set maintenance</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatus("OFFLINE")}>Set offline</DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (window.confirm(`Delete node "${node.hostname}"?`)) {
                  remove.mutate(node.id);
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <StatusBadge status={node.status} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Flame className="size-3" /> {formatTemperature(node.temperature)}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="size-3" /> {node.power_consumption.toFixed(0)}W
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <UsageBar label="CPU" value={node.cpu_usage} />
          <UsageBar label="GPU" value={node.gpu_usage} />
          <UsageBar label="Memory" value={node.memory_usage} />
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Cpu className="size-3" /> {node.cpu_cores} cores{node.gpu_count ? ` · ${node.gpu_count} GPU` : ""}
          </span>
          <span>{node.ram_gb}GB RAM</span>
        </div>
      </CardContent>
    </Card>
  );
}
