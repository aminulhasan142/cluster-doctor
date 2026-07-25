import { mockStore } from "./mock-store";
import type { RealityCompareResult, RealitySummary } from "@/types";

class RealityService {
  async compare(
    nodeId: string,
    telemetry: { cpu: number; memory: number; temperature: number }
  ): Promise<RealityCompareResult> {
    const node = mockStore.getNode(nodeId);
    const expectedTemp = 60;
    const isMismatch = Math.abs(telemetry.temperature - expectedTemp) > 15;

    return {
      node_id: Number(nodeId),
      hostname: node?.hostname ?? `node-${nodeId}`,
      match: !isMismatch,
      drift_score: isMismatch ? 0.42 : 0.05,
      actual: {
        cpu: telemetry.cpu,
        memory: telemetry.memory,
        temperature: telemetry.temperature,
      },
      expected: {
        cpu: 40.0,
        memory: 50.0,
        temperature: expectedTemp,
      },
      discrepancies: isMismatch
        ? [
            `Temperature junction is ${telemetry.temperature}°C (expected ~${expectedTemp}°C)`,
            `CPU load drift +${(telemetry.cpu - 40).toFixed(1)}% above digital twin baseline`,
          ]
        : [],
    } as unknown as RealityCompareResult;
  }

  async rawSummary(): Promise<RealitySummary> {
    return {
      total_nodes: 6,
      matched_nodes: 4,
      drifted_nodes: 2,
      average_drift: 0.12,
    } as unknown as RealitySummary;
  }
}

export const realityService = new RealityService();
