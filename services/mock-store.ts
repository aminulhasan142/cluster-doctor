import {
  INITIAL_MOCK_CLUSTERS,
  INITIAL_MOCK_NODES,
  INITIAL_MOCK_PREDICTIONS,
  INITIAL_MOCK_NOTIFICATIONS,
  generateTelemetryHistory,
} from "@/lib/mock-data";
import type {
  Cluster,
  ClusterCreateInput,
  ClusterUpdateInput,
  ClusterNode,
  NodeCreateInput,
  NodeUpdateInput,
  NodeStatus,
  Telemetry,
  Prediction,
  AppNotification,
  HealingRunResult,
} from "@/types";

const CLUSTERS_KEY = "cdoctor_clusters";
const NODES_KEY = "cdoctor_nodes";
const PREDICTIONS_KEY = "cdoctor_predictions";
const NOTIFICATIONS_KEY = "cdoctor_notifications";

class MockStore {
  private clusters: Cluster[] = [];
  private nodes: ClusterNode[] = [];
  private predictions: Prediction[] = [];
  private notifications: AppNotification[] = [];
  private telemetryMap: Record<number, Telemetry[]> = {};

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === "undefined") {
      this.clusters = [...INITIAL_MOCK_CLUSTERS];
      this.nodes = [...INITIAL_MOCK_NODES];
      this.predictions = [...INITIAL_MOCK_PREDICTIONS];
      this.notifications = [...INITIAL_MOCK_NOTIFICATIONS];
      return;
    }

    try {
      const c = localStorage.getItem(CLUSTERS_KEY);
      this.clusters = c ? JSON.parse(c) : [...INITIAL_MOCK_CLUSTERS];

      const n = localStorage.getItem(NODES_KEY);
      this.nodes = n ? JSON.parse(n) : [...INITIAL_MOCK_NODES];

      const p = localStorage.getItem(PREDICTIONS_KEY);
      this.predictions = p ? JSON.parse(p) : [...INITIAL_MOCK_PREDICTIONS];

      const notif = localStorage.getItem(NOTIFICATIONS_KEY);
      this.notifications = notif ? JSON.parse(notif) : [...INITIAL_MOCK_NOTIFICATIONS];
    } catch {
      this.clusters = [...INITIAL_MOCK_CLUSTERS];
      this.nodes = [...INITIAL_MOCK_NODES];
      this.predictions = [...INITIAL_MOCK_PREDICTIONS];
      this.notifications = [...INITIAL_MOCK_NOTIFICATIONS];
    }

    // Pre-populate telemetry for nodes
    for (const node of this.nodes) {
      this.telemetryMap[node.id] = generateTelemetryHistory(node.id, 24);
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CLUSTERS_KEY, JSON.stringify(this.clusters));
      localStorage.setItem(NODES_KEY, JSON.stringify(this.nodes));
      localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(this.predictions));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch {
      // ignore
    }
  }

  // --- CLUSTERS ---
  getClusters(): Cluster[] {
    return [...this.clusters];
  }

  getCluster(id: number | string): Cluster | undefined {
    const numId = Number(id);
    return this.clusters.find((c) => c.id === numId);
  }

  createCluster(input: ClusterCreateInput): Cluster {
    const newId = Math.max(0, ...this.clusters.map((c) => c.id)) + 1;
    const now = new Date().toISOString();
    const created: Cluster = {
      id: newId,
      name: input.name,
      description: input.description ?? null,
      location: input.location ?? null,
      owner_id: 1,
      health_score: 100,
      status: "HEALTHY",
      created_at: now,
      updated_at: now,
    };
    this.clusters.unshift(created);
    this.persist();
    return created;
  }

  updateCluster(id: number | string, input: ClusterUpdateInput): Cluster {
    const numId = Number(id);
    const index = this.clusters.findIndex((c) => c.id === numId);
    if (index === -1) throw new Error("Cluster not found");

    const updated: Cluster = {
      ...this.clusters[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    this.clusters[index] = updated;
    this.persist();
    return updated;
  }

  deleteCluster(id: number | string): void {
    const numId = Number(id);
    this.clusters = this.clusters.filter((c) => c.id !== numId);
    this.nodes = this.nodes.filter((n) => n.cluster_id !== numId);
    this.persist();
  }

  // --- NODES ---
  getNodes(): ClusterNode[] {
    return [...this.nodes];
  }

  getNode(id: number | string): ClusterNode | undefined {
    const numId = Number(id);
    return this.nodes.find((n) => n.id === numId);
  }

  getNodesByCluster(clusterId: number | string): ClusterNode[] {
    const numId = Number(clusterId);
    return this.nodes.filter((n) => n.cluster_id === numId);
  }

  createNode(input: NodeCreateInput): ClusterNode {
    const newId = Math.max(100, ...this.nodes.map((n) => n.id)) + 1;
    const now = new Date().toISOString();
    const created: ClusterNode = {
      id: newId,
      hostname: input.hostname,
      ip_address: input.ip_address,
      operating_system: input.operating_system ?? "Linux x86_64",
      cpu_model: input.cpu_model ?? "Intel Xeon Processor",
      cpu_cores: input.cpu_cores ?? 32,
      gpu_model: input.gpu_model ?? null,
      gpu_count: input.gpu_count ?? 0,
      ram_gb: input.ram_gb ?? 128,
      storage_gb: input.storage_gb ?? 1000,
      cluster_id: input.cluster_id,
      cpu_usage: 15.0,
      gpu_usage: 0.0,
      memory_usage: 25.0,
      temperature: 45.0,
      power_consumption: 400,
      status: "ONLINE",
      created_at: now,
      updated_at: now,
    };
    this.nodes.unshift(created);
    this.telemetryMap[newId] = generateTelemetryHistory(newId, 10);
    this.persist();
    return created;
  }

  updateNode(id: number | string, input: NodeUpdateInput): ClusterNode {
    const numId = Number(id);
    const index = this.nodes.findIndex((n) => n.id === numId);
    if (index === -1) throw new Error("Node not found");

    const updated: ClusterNode = {
      ...this.nodes[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    this.nodes[index] = updated;
    this.persist();
    return updated;
  }

  updateNodeStatus(id: number | string, status: NodeStatus): ClusterNode {
    return this.updateNode(id, { status });
  }

  deleteNode(id: number | string): void {
    const numId = Number(id);
    this.nodes = this.nodes.filter((n) => n.id !== numId);
    delete this.telemetryMap[numId];
    this.persist();
  }

  // --- TELEMETRY ---
  getLatestTelemetry(nodeId: number | string): Telemetry {
    const numId = Number(nodeId);
    const history = this.telemetryMap[numId] ?? generateTelemetryHistory(numId, 5);
    return history[history.length - 1];
  }

  getTelemetryHistory(nodeId: number | string): Telemetry[] {
    const numId = Number(nodeId);
    if (!this.telemetryMap[numId]) {
      this.telemetryMap[numId] = generateTelemetryHistory(numId, 20);
    }
    return [...this.telemetryMap[numId]];
  }

  pushTelemetryReading(nodeId: number, cpu: number, temp: number, ram: number) {
    const node = this.getNode(nodeId);
    if (node) {
      this.updateNode(nodeId, {
        cpu_usage: cpu,
        temperature: temp,
        memory_usage: ram,
      });
    }

    const currentHistory = this.getTelemetryHistory(nodeId);
    const last = currentHistory[currentHistory.length - 1];
    const newEntry: Telemetry = {
      ...last,
      id: last ? last.id + 1 : Date.now(),
      cpu_usage: cpu,
      cpu_temperature: temp,
      ram_usage: ram,
      recorded_at: new Date().toISOString(),
    };
    currentHistory.push(newEntry);
    if (currentHistory.length > 50) currentHistory.shift();
    this.telemetryMap[nodeId] = currentHistory;
  }

  // --- PREDICTIONS ---
  getPredictions(): Prediction[] {
    return [...this.predictions];
  }

  getHighRiskPredictions(threshold = 80): Prediction[] {
    return this.predictions.filter((p) => p.risk_score >= threshold);
  }

  getPendingPredictions(): Prediction[] {
    return this.predictions.filter((p) => p.status === "PENDING");
  }

  getPredictionsByNode(nodeId: number | string): Prediction[] {
    const numId = Number(nodeId);
    return this.predictions.filter((p) => p.node_id === numId);
  }

  // --- NOTIFICATIONS ---
  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  getUnreadNotifications(): AppNotification[] {
    return this.notifications.filter((n) => n.status === "UNREAD");
  }

  markNotificationRead(id: number | string): AppNotification {
    const numId = Number(id);
    const index = this.notifications.findIndex((n) => n.id === numId);
    if (index === -1) throw new Error("Notification not found");

    const updated: AppNotification = {
      ...this.notifications[index],
      status: "READ",
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.notifications[index] = updated;
    this.persist();
    return updated;
  }

  pushNotification(notif: Partial<AppNotification> & { title: string; message: string }) {
    const newId = Math.max(500, ...this.notifications.map((n) => n.id)) + 1;
    const now = new Date().toISOString();
    const created: AppNotification = {
      id: newId,
      title: notif.title,
      message: notif.message,
      category: notif.category ?? "simulation",
      threat_level: notif.threat_level ?? "MEDIUM",
      user_id: 1,
      cluster_id: notif.cluster_id ?? null,
      node_id: notif.node_id ?? null,
      prediction_id: notif.prediction_id ?? null,
      status: "UNREAD",
      read_at: null,
      created_at: now,
      updated_at: now,
    };
    this.notifications.unshift(created);
    this.persist();
    return created;
  }

  // --- MIGRATION & HEALING ---
  runHealingPipeline(clusterId: number, sourceNodeId: number): HealingRunResult {
    const sourceNode = this.getNode(sourceNodeId);
    const availableTargets = this.nodes.filter(
      (n) => n.id !== sourceNodeId && n.status === "ONLINE" && n.memory_usage < 80
    );

    const targetNode = availableTargets[0] ?? this.nodes.find((n) => n.id !== sourceNodeId);
    const targetNodeId = targetNode ? targetNode.id : 103;

    if (sourceNode) {
      this.updateNode(sourceNodeId, { status: "MAINTENANCE", cpu_usage: 10, temperature: 40 });
    }
    if (targetNode) {
      this.updateNode(targetNode.id, { cpu_usage: Math.min(95, targetNode.cpu_usage + 30) });
    }

    const prediction = this.predictions.find((p) => p.node_id === sourceNodeId);
    if (prediction) {
      prediction.status = "COMPLETED";
      this.persist();
    }

    const now = new Date().toISOString();
    return {
      success: true,
      reason: "Auto-migrated pod replicas to safe node target.",
      plan: {
        success: true,
        source_node: sourceNodeId,
        target_node: targetNodeId,
        health_score: 92,
        score: 88,
        reason: "Target node capacity optimal",
      },
      migration: {
        success: true,
        source_node: sourceNodeId,
        target_node: targetNodeId,
        migrated_at: now,
        status: "COMPLETED",
      },
      checkpoint: {
        workload_id: `workload_${sourceNodeId}`,
        checkpoint_restored: true,
        lost_steps: 0,
      },
      recovery: {
        success: true,
        checkpoint_restored: true,
        application_running: true,
        lost_steps: 0,
        status: "PASSED",
      },
    };
  }
}

export const mockStore = new MockStore();
