"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { realityService } from "@/services/reality.service";
import type { ClusterNode, RealityCheckRecord } from "@/types";

export function useRealityCompare() {
  return useMutation({
    mutationFn: ({
      nodeId,
      telemetry,
    }: {
      nodeId: string;
      telemetry: { cpu: number; memory: number; temperature: number };
    }) => realityService.compare(nodeId, telemetry),
  });
}

/**
 * The backend's `/reality/summary` is a hardcoded stub that always
 * returns zeros. This computes a real summary instead, by running a
 * live reality-compare for every online node (using that node's own
 * latest telemetry as the "actual" reading) and bucketing the results
 * — every number displayed is a genuine `/reality/compare` result.
 */
export function useComputedRealitySummary(nodes: ClusterNode[]) {
  const onlineNodes = nodes.filter((n) => n.status === "ONLINE");

  return useQuery({
    queryKey: ["reality", "computed-summary", onlineNodes.map((n) => n.id).join(",")],
    queryFn: async () => {
      const records: RealityCheckRecord[] = await Promise.all(
        onlineNodes.map(async (node) => {
          const result = await realityService.compare(String(node.id), {
            cpu: node.cpu_usage,
            memory: node.memory_usage,
            temperature: node.temperature,
          });

          return {
            node_id: String(node.id),
            cluster_id: String(node.cluster_id),
            checked_at: new Date().toISOString(),
            result,
          } satisfies RealityCheckRecord;
        })
      );

      const healthy = records.filter(
        (r) => r.result.success && r.result.status === "Healthy"
      ).length;
      const warning = records.filter(
        (r) => r.result.success && r.result.status === "Warning"
      ).length;
      const noSnapshot = records.filter((r) => !r.result.success).length;

      return {
        records,
        healthy_nodes: healthy,
        warning_nodes: warning,
        no_snapshot_nodes: noSnapshot,
      };
    },
    enabled: onlineNodes.length > 0,
    refetchInterval: 10000,
    retry: 1,
  });
}
