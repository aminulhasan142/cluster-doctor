"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { useClusterMutations, useClusters } from "@/hooks/use-cluster";
import { useNodes } from "@/hooks/use-node";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClusterTable } from "@/components/cluster/cluster-table";
import { ClusterFormDialog } from "@/components/cluster/cluster-form-dialog";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/common/state";
import type { Cluster } from "@/types";

export default function ClustersPage() {
  const { data: clusters, isLoading, isError, refetch } = useClusters();
  const { data: nodes } = useNodes();
  const { remove } = useClusterMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cluster | null>(null);

  const nodeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const node of nodes ?? []) {
      counts[node.cluster_id] = (counts[node.cluster_id] ?? 0) + 1;
    }
    return counts;
  }, [nodes]);

  const handleDelete = async (cluster: Cluster) => {
    if (!window.confirm(`Delete cluster "${cluster.name}"? This cannot be undone.`)) return;
    try {
      await remove.mutateAsync(cluster.id);
      toast.success("Cluster deleted");
    } catch {
      toast.error("Failed to delete cluster");
    }
  };

  return (
    <div>
      <PageHeader
        title="Clusters"
        description="Every compute cluster under AI supervision."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="size-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-3.5" />
              New cluster
            </Button>
          </>
        }
      />

      <Card className="glass-panel">
        <CardContent>
          {isLoading && <LoadingBlock rows={5} />}
          {isError && <ErrorState onRetry={() => refetch()} message="Could not load clusters." />}
          {!isLoading && !isError && clusters && clusters.length === 0 && (
            <EmptyState
              title="No clusters yet"
              description="Create your first cluster to start monitoring nodes."
              action={
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="size-3.5" /> New cluster
                </Button>
              }
            />
          )}
          {clusters && clusters.length > 0 && (
            <ClusterTable
              clusters={clusters}
              nodeCounts={nodeCounts}
              onEdit={(cluster) => {
                setEditing(cluster);
                setDialogOpen(true);
              }}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <ClusterFormDialog open={dialogOpen} onOpenChange={setDialogOpen} cluster={editing} />
    </div>
  );
}
