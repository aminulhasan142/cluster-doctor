"use client";

import { useQuery } from "@tanstack/react-query";

import { predictionService } from "@/services/prediction.service";

/**
 * There is no generic "list all predictions" endpoint on the backend.
 * `high-risk?threshold=0` returns every prediction (risk_score is
 * always >= 0), so it doubles as the "all predictions" feed while
 * still exposing the real threshold filter the endpoint supports.
 */
export function useAllPredictions(threshold = 0) {
  return useQuery({
    queryKey: ["predictions", "all", threshold],
    queryFn: () => predictionService.highRisk(threshold),
    refetchInterval: 10000,
  });
}

export function useHighRiskPredictions(threshold = 80) {
  return useQuery({
    queryKey: ["predictions", "high-risk", threshold],
    queryFn: () => predictionService.highRisk(threshold),
    refetchInterval: 10000,
  });
}

export function usePendingPredictions() {
  return useQuery({
    queryKey: ["predictions", "pending"],
    queryFn: () => predictionService.pending(),
    refetchInterval: 10000,
  });
}

export function useNodePredictions(nodeId?: number | string | null) {
  return useQuery({
    queryKey: ["predictions", "node", nodeId],
    queryFn: () => predictionService.byNode(nodeId as number | string),
    enabled: nodeId !== undefined && nodeId !== null,
    refetchInterval: 10000,
  });
}

export function useLatestPrediction(nodeId?: number | string | null) {
  return useQuery({
    queryKey: ["predictions", "latest", nodeId],
    queryFn: () => predictionService.latest(nodeId as number | string),
    enabled: nodeId !== undefined && nodeId !== null,
    retry: 1,
  });
}
