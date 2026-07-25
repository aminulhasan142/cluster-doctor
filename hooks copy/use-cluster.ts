"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clusterService } from "@/services/cluster.service";
import { useClusterStore } from "@/store/cluster-store";
import type { ClusterCreateInput, ClusterUpdateInput } from "@/types";

export function useClusters() {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: () => clusterService.list(),
    refetchInterval: 15000,
  });
}

export function useCluster(id?: number | string | null) {
  return useQuery({
    queryKey: ["clusters", id],
    queryFn: () => clusterService.get(id as number | string),
    enabled: id !== undefined && id !== null,
  });
}

export function useClusterMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["clusters"] });

  const create = useMutation({
    mutationFn: (data: ClusterCreateInput) => clusterService.create(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: ClusterUpdateInput }) =>
      clusterService.update(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number | string) => clusterService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export { useClusterStore };
