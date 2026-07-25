"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { recoveryService } from "@/services/recovery.service";

/** Thin wrappers around the backend's stubbed `/recovery/*` router. */
export function useTriggerRecoveryStub() {
  return useMutation({
    mutationFn: (nodeId: number | string) => recoveryService.start(nodeId),
  });
}

export function useRecoveryStatusStub(nodeId?: number | string | null) {
  return useQuery({
    queryKey: ["recovery", "status", nodeId],
    queryFn: () => recoveryService.status(nodeId as number | string),
    enabled: nodeId !== undefined && nodeId !== null,
  });
}

export function useRecoveryHistoryStub(nodeId?: number | string | null) {
  return useQuery({
    queryKey: ["recovery", "history", nodeId],
    queryFn: () => recoveryService.history(nodeId as number | string),
    enabled: nodeId !== undefined && nodeId !== null,
  });
}
