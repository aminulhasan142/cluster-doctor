"use client";

import Link from "next/link";
import { Target } from "lucide-react";

import { useHighRiskPredictions } from "@/hooks/use-predictions";
import { useNodesByCluster } from "@/hooks/use-node";
import { useMigrationCandidates } from "@/hooks/use-migration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/state";

export function SafeTargetCard() {
  const { data: highRisk, isLoading: loadingPredictions } = useHighRiskPredictions(70);
  const topRisk = highRisk?.[0];

  const { data: clusterNodes, isLoading: loadingNodes } = useNodesByCluster(topRisk?.cluster_id);
  const candidates = useMigrationCandidates(topRisk?.node_id, clusterNodes);
  const safest = candidates.find((c) => c.is_safest);

  const isLoading = loadingPredictions || (!!topRisk && loadingNodes);

  return (
    <Card className="glass-panel gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          Safe Migration Target
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-24 w-full rounded-lg" />}
        {!isLoading && !topRisk && (
          <EmptyState
            title="No migration needed"
            description="No node currently has an elevated failure risk."
          />
        )}
        {!isLoading && topRisk && !safest && (
          <EmptyState
            title="No safe target available"
            description={`Every other node in cluster #${topRisk.cluster_id} is offline or unavailable.`}
          />
        )}
        {!isLoading && topRisk && safest && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              For at-risk node <span className="text-foreground">#{topRisk.node_id}</span> in cluster #
              {topRisk.cluster_id}
            </p>
            <div className="flex items-center justify-between rounded-lg border border-success/25 bg-success/5 px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold text-foreground">{safest.hostname}</p>
                <p className="text-xs text-muted-foreground">
                  Health {safest.health_score} · {safest.free_memory}% free memory
                </p>
              </div>
              <Badge className="bg-success/15 text-success" variant="outline">
                Score {safest.safe_score}
              </Badge>
            </div>
            <Link href="/migration" className="block text-center text-xs text-primary hover:underline">
              Open Migration Center →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
