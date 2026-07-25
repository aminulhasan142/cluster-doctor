"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";

import { useNodes } from "@/hooks/use-node";
import { useClusters } from "@/hooks/use-cluster";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { NodeCard } from "@/components/node/node-card";
import { NodeFormDialog } from "@/components/node/node-form-dialog";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/common/state";

export default function NodesPage() {
  return (
    <Suspense fallback={<LoadingBlock rows={4} />}>
      <NodesPageContent />
    </Suspense>
  );
}

function NodesPageContent() {
  const searchParams = useSearchParams();
  const clusterFilterFromUrl = searchParams.get("cluster");

  const { data: nodes, isLoading, isError, refetch } = useNodes();
  const { data: clusters } = useClusters();

  const [clusterFilter, setClusterFilter] = useState(clusterFilterFromUrl ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    return (nodes ?? []).filter((n) => {
      if (clusterFilter !== "all" && String(n.cluster_id) !== clusterFilter) return false;
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      return true;
    });
  }, [nodes, clusterFilter, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Nodes"
        description="Every compute node the AI is tracking, with live utilization."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="size-3.5" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-3.5" />
              Add node
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as string)}>
          <TabsList>
            <TabsTab value="all">All</TabsTab>
            <TabsTab value="ONLINE">Online</TabsTab>
            <TabsTab value="OFFLINE">Offline</TabsTab>
            <TabsTab value="MAINTENANCE">Maintenance</TabsTab>
            <TabsTab value="FAILED">Failed</TabsTab>
          </TabsList>
        </Tabs>

        <Select value={clusterFilter} onValueChange={(v) => setClusterFilter(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All clusters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clusters</SelectItem>
            {clusters?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <LoadingBlock rows={4} />}
      {isError && <ErrorState onRetry={() => refetch()} message="Could not load nodes." />}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState title="No nodes match this filter" description="Try a different cluster or status." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </div>

      <NodeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultClusterId={clusterFilter !== "all" ? Number(clusterFilter) : undefined}
      />
    </div>
  );
}
