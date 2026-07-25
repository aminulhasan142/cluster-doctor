"use client";

import { useQuery } from "@tanstack/react-query";

import { twinService } from "@/services/twin.service";

export function useTwinClusters() {
  return useQuery({
    queryKey: ["twin", "clusters"],
    queryFn: () => twinService.clusters(),
    refetchInterval: 4000,
  });
}

export function useTwinCluster(clusterId?: string | null) {
  return useQuery({
    queryKey: ["twin", "clusters", clusterId],
    queryFn: () => twinService.cluster(clusterId as string),
    enabled: !!clusterId,
    refetchInterval: 4000,
  });
}

export function useTwinRooms() {
  return useQuery({
    queryKey: ["twin", "rooms"],
    queryFn: () => twinService.rooms(),
    refetchInterval: 15000,
  });
}

export function useTwinNode(nodeId?: string | null) {
  return useQuery({
    queryKey: ["twin", "node", nodeId],
    queryFn: () => twinService.node(nodeId as string),
    enabled: !!nodeId,
    refetchInterval: 4000,
  });
}

export function useTwinSnapshot(nodeId?: string | null) {
  return useQuery({
    queryKey: ["twin", "snapshot", nodeId],
    queryFn: () => twinService.snapshot(nodeId as string),
    enabled: !!nodeId,
    refetchInterval: 5000,
  });
}

export { useTwinStore } from "@/store/twin-store";
