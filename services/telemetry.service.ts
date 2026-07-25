import { mockStore } from "./mock-store";
import type { Telemetry, TelemetryCreateInput } from "@/types";

class TelemetryService {
  async create(data: TelemetryCreateInput): Promise<Telemetry> {
    mockStore.pushTelemetryReading(
      data.node_id,
      data.cpu_usage,
      data.cpu_temperature,
      data.ram_usage
    );
    return mockStore.getLatestTelemetry(data.node_id);
  }

  async get(id: number | string): Promise<Telemetry> {
    return mockStore.getLatestTelemetry(101);
  }

  async latest(nodeId: number | string): Promise<Telemetry> {
    return mockStore.getLatestTelemetry(nodeId);
  }

  async history(
    nodeId: number | string,
    _startTime?: string,
    _endTime?: string
  ): Promise<Telemetry[]> {
    return mockStore.getTelemetryHistory(nodeId);
  }

  async byCluster(clusterId: number | string): Promise<Telemetry[]> {
    const nodes = mockStore.getNodesByCluster(clusterId);
    const result: Telemetry[] = [];
    for (const n of nodes) {
      result.push(mockStore.getLatestTelemetry(n.id));
    }
    return result;
  }
}

export const telemetryService = new TelemetryService();
