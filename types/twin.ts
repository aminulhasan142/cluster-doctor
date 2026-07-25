/**
 * Digital Twin — in-memory state mirrored from `/twin/*`.
 * Node/cluster IDs are strings here because the backend's
 * twin manager keys everything by whatever MQTT sent.
 */
export interface TwinNode {
  node_id: string;
  status: string;
  cpu: number;
  memory: number;
  gpu: number;
  temperature: number;
  power: number;
  risk_score: number;
  prediction: string;
  recommendation: string;
  updated_at: string;
}

export interface TwinCluster {
  cluster_id: string;
  health: number;
  updated_at: string;
  nodes: TwinNode[];
}

export interface TwinSnapshot {
  cluster_id: string;
  node_id: string;
  cpu_usage: number;
  cpu_temperature: number;
  gpu_usage: number;
  gpu_temperature: number;
  ram_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  health_score: number;
  risk_score: number;
  timestamp: string;
}

export interface TwinRack {
  rack_id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  nodes: TwinNode[];
}

export interface TwinRoom {
  room_id: string;
  name: string;
  racks: TwinRack[];
}

/**
 * Twin Reality Check — output of `POST /reality/compare/{node_id}`.
 * All numbers here are real, backend-computed values; nothing
 * is invented client-side.
 */
export interface RealityMetricCheck {
  success: boolean;
  metric: string;
  predicted: number;
  actual: number;
  gap: number;
  accuracy: number;
  status: "Healthy" | "Warning";
}

export interface RealityCompareResult {
  success: boolean;
  message?: string;
  cpu?: RealityMetricCheck;
  ram?: RealityMetricCheck;
  temperature?: RealityMetricCheck;
  average_gap?: number;
  average_accuracy?: number;
  status?: "Healthy" | "Warning";
}

export interface RealityCheckRecord {
  node_id: string;
  cluster_id?: string;
  checked_at: string;
  result: RealityCompareResult;
}

export interface RealitySummary {
  healthy_nodes: number;
  warning_nodes: number;
  critical_nodes: number;
}
