import { mockStore } from "./mock-store";

class SimulatorService {
  async publish(): Promise<unknown> {
    const node102 = mockStore.getNode(102);
    const newTemp = Math.min(98, (node102?.temperature ?? 85) + 3);
    const newCpu = Math.min(99, (node102?.cpu_usage ?? 90) + 4);

    mockStore.pushTelemetryReading(102, newCpu, newTemp, 94);

    mockStore.pushNotification({
      title: "Simulated Telemetry Pulse Triggered",
      message: `Thermal reading for gpu-node-alpha-02 updated: ${newTemp}°C / ${newCpu}% CPU load.`,
      category: "simulation",
      threat_level: newTemp > 90 ? "CRITICAL" : "HIGH",
      node_id: 102,
      cluster_id: 1,
    });

    return {
      status: "published",
      topic: "clusterdoctor/telemetry/102",
      node_id: 102,
      temperature: newTemp,
      cpu_usage: newCpu,
    };
  }
}

export const simulatorService = new SimulatorService();
