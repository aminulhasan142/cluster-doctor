import { create } from "zustand";

import type { ClusterNode } from "@/types";

interface NodeStore {
  selectedNode: ClusterNode | null;
  setSelectedNode: (node: ClusterNode | null) => void;
  reset: () => void;
}

export const useNodeStore = create<NodeStore>((set) => ({
  selectedNode: null,

  setSelectedNode: (node) => set({ selectedNode: node }),

  reset: () => set({ selectedNode: null }),
}));
