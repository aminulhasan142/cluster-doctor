"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { migrationService } from "@/services/migration.service";
import { useMigrationLogStore } from "@/store/migration-log-store";
import { computeNodeHealthScore, computeSafeScore } from "@/lib/format";
import { explainMigrationDecision } from "@/lib/explain";
import type { ClusterNode, MigrationCandidate, Prediction } from "@/types";

/**
 * Ranks every other online node in the same cluster using the exact
 * formula the backend applies in `healing_pipeline.run()`, so the
 * "Safe Target Selection" panel previews the real outcome before the
 * migration is actually triggered.
 */
export function buildMigrationCandidates(
  sourceNodeId: number,
  clusterNodes: ClusterNode[]
): MigrationCandidate[] {
  const candidates = clusterNodes
    .filter((node) => node.id !== sourceNodeId)
    .map((node) => {
      const healthScore = computeNodeHealthScore(node);
      const safeScore = computeSafeScore(healthScore, node.memory_usage);
      const available = node.status === "ONLINE";

      const candidate: MigrationCandidate = {
        node_id: node.id,
        hostname: node.hostname,
        health_score: healthScore,
        free_memory: Math.round((100 - node.memory_usage) * 100) / 100,
        memory_usage: node.memory_usage,
        risk_score: Math.round((100 - healthScore) * 100) / 100,
        temperature: node.temperature,
        cpu_usage: node.cpu_usage,
        gpu_usage: node.gpu_usage,
        available,
        safe_score: available ? safeScore : 0,
        is_safest: false,
      };
      return candidate;
    })
    .sort((a, b) => b.safe_score - a.safe_score);

  const firstAvailable = candidates.find((c) => c.available);
  if (firstAvailable) firstAvailable.is_safest = true;

  return candidates;
}

export function useMigrationCandidates(sourceNodeId?: number | null, clusterNodes?: ClusterNode[]) {
  return useMemo(() => {
    if (!sourceNodeId || !clusterNodes) return [];
    return buildMigrationCandidates(sourceNodeId, clusterNodes);
  }, [sourceNodeId, clusterNodes]);
}

export function useTriggerMigration() {
  const addEntry = useMigrationLogStore((s) => s.addEntry);

  return useMutation({
    mutationFn: async ({
      prediction,
      hostnames,
    }: {
      prediction: Prediction | { cluster_id: number; node_id: number };
      hostnames?: Record<number, string>;
    }) => {
      const startedAt = performance.now();
      const result = await migrationService.start(prediction);
      const durationMs = performance.now() - startedAt;

      const explanation = explainMigrationDecision(result, hostnames);

      addEntry({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        cluster_id: prediction.cluster_id,
        source_node_id: prediction.node_id,
        prediction: "id" in prediction ? (prediction as Prediction) : undefined,
        result,
        duration_ms: durationMs,
        explanation,
      });

      return { result, durationMs, explanation };
    },
  });
}

export function useMigrationHistory() {
  return useQuery({
    queryKey: ["migration", "history"],
    queryFn: () => migrationService.history(),
  });
}

export { useMigrationLogStore };
