import { create } from "zustand";

import type { Cluster } from "@/types";

interface ClusterStore {
  selectedCluster: Cluster | null;
  setSelectedCluster: (cluster: Cluster | null) => void;
  reset: () => void;
}

export const useClusterStore = create<ClusterStore>((set) => ({
  selectedCluster: null,

  setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),

  reset: () => set({ selectedCluster: null }),
}));
