"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

import { useHighRiskPredictions } from "@/hooks/use-predictions";
import { useNode, useNodesByCluster } from "@/hooks/use-node";
import { useMigrationCandidates, useTriggerMigration } from "@/hooks/use-migration";
import { predictionService } from "@/services/prediction.service";
import { useQuery } from "@tanstack/react-query";
import { formatPercent } from "@/lib/format";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/common/status";
import { UsageBar } from "@/components/node/usage-bar";
import { EmptyState, LoadingBlock } from "@/components/common/state";
import { CandidateTable } from "@/components/migration/candidate-table";
import { MigrationProgress } from "@/components/migration/migration-progress";
import { ActionLog } from "@/components/migration/action-log";

export default function MigrationPage() {
  return (
    <Suspense fallback={<LoadingBlock rows={4} />}>
      <MigrationPageContent />
    </Suspense>
  );
}

function MigrationPageContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("predictionId");

  const { data: highRisk, isLoading: loadingList } = useHighRiskPredictions(50);
  const [predictionId, setPredictionId] = useState<string | undefined>(preselectedId ?? undefined);

  useEffect(() => {
    if (preselectedId) setPredictionId(preselectedId);
  }, [preselectedId]);

  const inList = highRisk?.find((p) => String(p.id) === predictionId);
  const { data: fallbackPrediction } = useQuery({
    queryKey: ["predictions", "byId-fallback", predictionId],
    queryFn: () => predictionService.get(predictionId as string),
    enabled: !!predictionId && !inList,
  });

  const prediction = inList ?? fallbackPrediction;

  const { data: sourceNode } = useNode(prediction?.node_id);
  const { data: clusterNodes, isLoading: loadingNodes } = useNodesByCluster(prediction?.cluster_id);
  const candidates = useMigrationCandidates(prediction?.node_id, clusterNodes);
  const safest = candidates.find((c) => c.is_safest);

  const hostnames = useMemo(() => {
    const map: Record<number, string> = {};
    if (sourceNode) map[sourceNode.id] = sourceNode.hostname;
    for (const n of clusterNodes ?? []) map[n.id] = n.hostname;
    return map;
  }, [sourceNode, clusterNodes]);

  const trigger = useTriggerMigration();

  const handleMigrate = async () => {
    if (!prediction) return;
    try {
      await trigger.mutateAsync({ prediction, hostnames });
      toast.success("Migration pipeline completed");
    } catch {
      toast.error("Migration request failed — is the backend running?");
    }
  };

  const result = trigger.data?.result;

  return (
    <div>
      <PageHeader
        title="Migration Center"
        description="Safe target selection, workload migration, and recovery verification."
        actions={
          <Select value={predictionId} onValueChange={(v) => setPredictionId(v ?? undefined)}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Select an at-risk prediction" />
            </SelectTrigger>
            <SelectContent>
              {highRisk?.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  Node #{p.node_id} · {p.predicted_label} · {formatPercent(p.risk_score, 0)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {loadingList && <LoadingBlock rows={4} />}

      {!loadingList && !prediction && (
        <EmptyState
          title="Select a prediction to plan a migration"
          description="Choose a node with elevated risk from the dropdown above, or trigger one from the Predictions page."
        />
      )}

      {prediction && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="glass-panel gap-3">
              <CardHeader>
                <CardTitle>Current Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sourceNode ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{sourceNode.hostname}</p>
                      <StatusBadge status={sourceNode.status} />
                    </div>
                    <UsageBar label="CPU" value={sourceNode.cpu_usage} />
                    <UsageBar label="GPU" value={sourceNode.gpu_usage} />
                    <UsageBar label="Memory" value={sourceNode.memory_usage} />
                    <div className="flex items-center justify-between rounded-lg border border-danger/25 bg-danger/5 px-3 py-2 text-xs">
                      <span className="text-foreground">{prediction.predicted_label}</span>
                      <span className="font-semibold text-danger">
                        {formatPercent(prediction.risk_score, 0)} risk
                      </span>
                    </div>
                    {prediction.explanation && (
                      <p className="text-xs text-muted-foreground">{prediction.explanation}</p>
                    )}
                  </>
                ) : (
                  <LoadingBlock rows={2} />
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel gap-3">
              <CardHeader>
                <CardTitle>Trigger Safe Migration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {safest ? (
                  <div className="rounded-lg border border-success/25 bg-success/5 p-3">
                    <p className="text-xs text-muted-foreground">AI-selected safest target</p>
                    <p className="text-base font-semibold text-foreground">{safest.hostname}</p>
                    <p className="text-xs text-muted-foreground">
                      Score {safest.safe_score} · Health {safest.health_score} · {safest.free_memory}% free
                    </p>
                  </div>
                ) : (
                  !loadingNodes && (
                    <EmptyState title="No safe target" description="Every other node is offline or over capacity." />
                  )
                )}

                <Button
                  className="w-full"
                  disabled={!safest || trigger.isPending}
                  onClick={handleMigrate}
                >
                  <Wand2 className="size-4" />
                  {trigger.isPending ? "Migrating…" : "Migrate Now"}
                </Button>

                <MigrationProgress running={trigger.isPending} />
              </CardContent>
            </Card>
          </div>

          {candidates.length > 0 && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Candidate Nodes — AI Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <CandidateTable candidates={candidates} />
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="glass-panel gap-2">
                <CardHeader>
                  <CardTitle className="text-sm">Verification</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {result.plan?.success ? (
                    <p>
                      Target node <span className="text-foreground">#{result.plan.target_node}</span> selected with
                      score <span className="text-foreground">{result.plan.score}</span>.
                    </p>
                  ) : (
                    <p>{result.plan?.reason ?? result.reason ?? "No target selected."}</p>
                  )}
                </CardContent>
              </Card>
              <Card className="glass-panel gap-2">
                <CardHeader>
                  <CardTitle className="text-sm">Checkpoint Restore</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {result.checkpoint ? (
                    <p>
                      {result.checkpoint.checkpoint_restored ? "Restored" : "Failed"} ·{" "}
                      {result.checkpoint.lost_steps} lost step(s)
                    </p>
                  ) : (
                    <p>Not reached.</p>
                  )}
                </CardContent>
              </Card>
              <Card className="glass-panel gap-2">
                <CardHeader>
                  <CardTitle className="text-sm">Recovery Confirmation</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {result.recovery ? (
                    <div className="flex items-center gap-2">
                      <StatusBadge status={result.recovery.status} />
                      <span>{result.recovery.application_running ? "App running" : ""}</span>
                    </div>
                  ) : (
                    <p>Not reached.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <ActionLog />
      </div>
    </div>
  );
}
