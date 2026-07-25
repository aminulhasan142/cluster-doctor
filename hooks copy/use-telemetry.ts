"use client";

import { useQuery } from "@tanstack/react-query";

import { telemetryService } from "@/services/telemetry.service";

export function useLatestTelemetry(nodeId?: number | string | null, pollMs = 5000) {
  return useQuery({
    queryKey: ["telemetry", "latest", nodeId],
    queryFn: () => telemetryService.latest(nodeId as number | string),
    enabled: nodeId !== undefined && nodeId !== null,
    refetchInterval: pollMs,
    retry: 1,
  });
}

export function useTelemetryHistory(
  nodeId: number | string | null | undefined,
  startTime: string,
  endTime: string,
  pollMs = 10000
) {
  return useQuery({
    queryKey: ["telemetry", "history", nodeId, startTime, endTime],
    queryFn: () => telemetryService.history(nodeId as number | string, startTime, endTime),
    enabled: nodeId !== undefined && nodeId !== null,
    refetchInterval: pollMs,
    retry: 1,
  });
}

export function useClusterTelemetry(clusterId?: number | string | null, pollMs = 10000) {
  return useQuery({
    queryKey: ["telemetry", "cluster", clusterId],
    queryFn: () => telemetryService.byCluster(clusterId as number | string),
    enabled: clusterId !== undefined && clusterId !== null,
    refetchInterval: pollMs,
    retry: 1,
  });
}
