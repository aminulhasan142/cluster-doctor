export interface DashboardOverview {
  clusters: number;
  nodes: number;
  healthy_clusters: number;
  warning_clusters: number;
  critical_clusters: number;
  online_nodes: number;
  offline_nodes: number;
  pending_predictions: number;
  critical_notifications: number;
  system_health: number;
}
