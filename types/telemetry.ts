export interface Telemetry {
  id: number;
  cluster_id: number;
  node_id: number;
  cpu_usage: number;
  cpu_temperature: number;
  cpu_frequency: number;
  gpu_usage: number;
  gpu_temperature: number;
  gpu_memory_usage: number;
  gpu_power: number;
  ram_usage: number;
  swap_usage: number;
  disk_usage: number;
  disk_read_speed: number;
  disk_write_speed: number;
  network_in: number;
  network_out: number;
  latency: number;
  packet_loss: number;
  recorded_at: string;
}

export interface TelemetryCreateInput {
  cluster_id: number;
  node_id: number;
  cpu_usage: number;
  cpu_temperature: number;
  cpu_frequency: number;
  gpu_usage: number;
  gpu_temperature: number;
  gpu_memory_usage: number;
  gpu_power: number;
  ram_usage: number;
  swap_usage: number;
  disk_usage: number;
  disk_read_speed: number;
  disk_write_speed: number;
  network_in: number;
  network_out: number;
  latency: number;
  packet_loss: number;
}
