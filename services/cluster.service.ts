import { mockStore } from "./mock-store";
import type { Cluster, ClusterCreateInput, ClusterUpdateInput } from "@/types";

class ClusterService {
  async list(): Promise<Cluster[]> {
    return mockStore.getClusters();
  }

  async mine(): Promise<Cluster[]> {
    return mockStore.getClusters();
  }

  async get(id: number | string): Promise<Cluster> {
    const cluster = mockStore.getCluster(id);
    if (!cluster) throw new Error("Cluster not found");
    return cluster;
  }

  async create(data: ClusterCreateInput): Promise<Cluster> {
    return mockStore.createCluster(data);
  }

  async update(id: number | string, data: ClusterUpdateInput): Promise<Cluster> {
    return mockStore.updateCluster(id, data);
  }

  async remove(id: number | string): Promise<void> {
    mockStore.deleteCluster(id);
  }

  async healthy(): Promise<Cluster[]> {
    return mockStore.getClusters().filter((c) => c.status === "HEALTHY");
  }

  async critical(): Promise<Cluster[]> {
    return mockStore.getClusters().filter((c) => c.status === "CRITICAL" || c.status === "WARNING");
  }
}

export const clusterService = new ClusterService();
