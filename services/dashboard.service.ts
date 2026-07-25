import { mockStore } from "./mock-store";
import type { DashboardOverview } from "@/types";

class DashboardService {
  async overview(): Promise<DashboardOverview> {
    const clusters = mockStore.getClusters();
    const nodes = mockStore.getNodes();
    const predictions = mockStore.getPendingPredictions();
    const notifs = mockStore.getNotifications();

    const healthyClusters = clusters.filter((c) => c.status === "HEALTHY").length;
    const warningClusters = clusters.filter((c) => c.status === "WARNING").length;
    const criticalClusters = clusters.filter((c) => c.status === "CRITICAL").length;

    const onlineNodes = nodes.filter((n) => n.status === "ONLINE").length;
    const offlineNodes = nodes.filter((n) => n.status !== "ONLINE").length;
    const criticalNotifs = notifs.filter((n) => n.threat_level === "CRITICAL").length;

    const healthRatio = clusters.length > 0 ? (healthyClusters / clusters.length) * 100 : 100;

    return {
      clusters: clusters.length,
      nodes: nodes.length,
      healthy_clusters: healthyClusters,
      warning_clusters: warningClusters,
      critical_clusters: criticalClusters,
      online_nodes: onlineNodes,
      offline_nodes: offlineNodes,
      pending_predictions: predictions.length,
      critical_notifications: criticalNotifs,
      system_health: Math.round(healthRatio),
    };
  }

  async summary(): Promise<DashboardOverview> {
    return this.overview();
  }
}

export const dashboardService = new DashboardService();
