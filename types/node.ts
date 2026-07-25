export type NodeStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "FAILED";

export interface ClusterNode {
  id: number;
  hostname: string;
  ip_address: string;
  operating_system: string | null;
  cpu_model: string | null;
  cpu_cores: number;
  gpu_model: string | null;
  gpu_count: number;
  ram_gb: number;
  storage_gb: number;
  cluster_id: number;
  cpu_usage: number;
  gpu_usage: number;
  memory_usage: number;
  temperature: number;
  power_consumption: number;
  status: NodeStatus;
  created_at: string;
  updated_at: string;
}

export interface NodeCreateInput {
  hostname: string;
  ip_address: string;
  operating_system?: string;
  cpu_model?: string;
  cpu_cores?: number;
  gpu_model?: string;
  gpu_count?: number;
  ram_gb?: number;
  storage_gb?: number;
  cluster_id: number;
}

export interface NodeUpdateInput {
  hostname?: string;
  ip_address?: string;
  operating_system?: string;
  cpu_model?: string;
  cpu_cores?: number;
  gpu_model?: string;
  gpu_count?: number;
  ram_gb?: number;
  storage_gb?: number;
  status?: NodeStatus;
  cpu_usage?: number;
  gpu_usage?: number;
  memory_usage?: number;
  temperature?: number;
  power_consumption?: number;
}
