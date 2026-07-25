import { MOCK_TWIN_CLUSTERS, MOCK_TWIN_ROOMS } from "@/lib/mock-data";
import { mockStore } from "./mock-store";
import type { TwinCluster, TwinNode, TwinRoom, TwinSnapshot } from "@/types";

class TwinService {
  async clusters(): Promise<TwinCluster[]> {
    return MOCK_TWIN_CLUSTERS;
  }

  async cluster(clusterId: string): Promise<TwinCluster | null> {
    return MOCK_TWIN_CLUSTERS.find((c) => c.cluster_id === String(clusterId)) ?? null;
  }

  async rooms(): Promise<TwinRoom[]> {
    return MOCK_TWIN_ROOMS;
  }

  async node(nodeId: string): Promise<TwinNode | null> {
    const node = mockStore.getNode(nodeId);
    if (!node) return null;
    return {
      node_id: String(node.id),
      status: node.status,
      cpu: node.cpu_usage,
      memory: node.memory_usage,
      gpu: node.gpu_usage,
      temperature: node.temperature,
      power: node.power_consumption,
      risk_score: node.temperature > 85 ? 89 : 10,
      prediction: node.temperature > 85 ? "Thermal Runaway" : "Normal",
      recommendation: node.temperature > 85 ? "Migrate pods" : "None",
      updated_at: new Date().toISOString(),
    };
  }

  async snapshot(nodeId: string): Promise<TwinSnapshot | null> {
    const telemetry = mockStore.getLatestTelemetry(nodeId);
    return {
      cluster_id: String(telemetry.cluster_id),
      node_id: String(nodeId),
      cpu_usage: telemetry.cpu_usage,
      cpu_temperature: telemetry.cpu_temperature,
      gpu_usage: telemetry.gpu_usage,
      gpu_temperature: telemetry.gpu_temperature,
      ram_usage: telemetry.ram_usage,
      disk_usage: telemetry.disk_usage,
      network_in: telemetry.network_in,
      network_out: telemetry.network_out,
      health_score: telemetry.cpu_temperature > 85 ? 40 : 95,
      risk_score: telemetry.cpu_temperature > 85 ? 89 : 10,
      timestamp: telemetry.recorded_at,
    };
  }
}

export const twinService = new TwinService();
