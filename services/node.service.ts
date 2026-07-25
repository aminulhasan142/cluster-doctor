import { mockStore } from "./mock-store";
import type { ClusterNode, NodeCreateInput, NodeUpdateInput, NodeStatus } from "@/types";

class NodeService {
  async list(): Promise<ClusterNode[]> {
    return mockStore.getNodes();
  }

  async get(id: number | string): Promise<ClusterNode> {
    const node = mockStore.getNode(id);
    if (!node) throw new Error("Node not found");
    return node;
  }

  async byCluster(clusterId: number | string): Promise<ClusterNode[]> {
    return mockStore.getNodesByCluster(clusterId);
  }

  async create(data: NodeCreateInput): Promise<ClusterNode> {
    return mockStore.createNode(data);
  }

  async update(id: number | string, data: NodeUpdateInput): Promise<ClusterNode> {
    return mockStore.updateNode(id, data);
  }

  async remove(id: number | string): Promise<void> {
    mockStore.deleteNode(id);
  }

  async online(): Promise<ClusterNode[]> {
    return mockStore.getNodes().filter((n) => n.status === "ONLINE");
  }

  async offline(): Promise<ClusterNode[]> {
    return mockStore.getNodes().filter((n) => n.status === "OFFLINE" || n.status === "FAILED");
  }

  async updateStatus(id: number | string, status: NodeStatus): Promise<ClusterNode> {
    return mockStore.updateNodeStatus(id, status);
  }
}

export const nodeService = new NodeService();
