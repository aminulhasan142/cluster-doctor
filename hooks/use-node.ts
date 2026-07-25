"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { nodeService } from "@/services/node.service";
import { useNodeStore } from "@/store/node-store";
import type { NodeCreateInput, NodeStatus, NodeUpdateInput } from "@/types";

export function useNodes() {
  return useQuery({
    queryKey: ["nodes"],
    queryFn: () => nodeService.list(),
    refetchInterval: 10000,
  });
}

export function useNodesByCluster(clusterId?: number | string | null) {
  return useQuery({
    queryKey: ["nodes", "cluster", clusterId],
    queryFn: () => nodeService.byCluster(clusterId as number | string),
    enabled: clusterId !== undefined && clusterId !== null,
    refetchInterval: 10000,
  });
}

export function useNode(id?: number | string | null) {
  return useQuery({
    queryKey: ["nodes", id],
    queryFn: () => nodeService.get(id as number | string),
    enabled: id !== undefined && id !== null,
    refetchInterval: 10000,
  });
}

export function useNodeMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["nodes"] });

  const create = useMutation({
    mutationFn: (data: NodeCreateInput) => nodeService.create(data),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: NodeUpdateInput }) =>
      nodeService.update(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number | string) => nodeService.remove(id),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number | string; status: NodeStatus }) =>
      nodeService.updateStatus(id, status),
    onSuccess: invalidate,
  });

  return { create, update, remove, updateStatus };
}

export { useNodeStore };
