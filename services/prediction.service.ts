import { mockStore } from "./mock-store";
import type { Prediction } from "@/types";

export interface PredictionCreateInput {
  cluster_id: number;
  node_id: number;
  model_name: string;
  prediction_type: string;
  confidence: number;
  risk_score: number;
  probability: number;
  predicted_label: string;
  recommendation?: string;
  explanation?: string;
}

class PredictionService {
  async create(data: PredictionCreateInput): Promise<Prediction> {
    const list = mockStore.getPredictions();
    const newId = Math.max(900, ...list.map((p) => p.id)) + 1;
    const now = new Date().toISOString();
    const created: Prediction = {
      id: newId,
      cluster_id: data.cluster_id,
      node_id: data.node_id,
      model_name: data.model_name,
      prediction_type: data.prediction_type,
      confidence: data.confidence,
      risk_score: data.risk_score,
      probability: data.probability,
      predicted_label: data.predicted_label,
      recommendation: data.recommendation ?? "Auto-healing recommended.",
      explanation: data.explanation ?? "Anomaly detected by AI pipeline.",
      status: "PENDING",
      predicted_at: now,
      created_at: now,
      updated_at: now,
    };
    list.unshift(created);
    return created;
  }

  async get(id: number | string): Promise<Prediction> {
    const p = mockStore.getPredictions().find((x) => x.id === Number(id));
    if (!p) throw new Error("Prediction not found");
    return p;
  }

  async latest(nodeId: number | string): Promise<Prediction> {
    const list = mockStore.getPredictionsByNode(nodeId);
    return list[0] ?? mockStore.getPredictions()[0];
  }

  async byNode(nodeId: number | string): Promise<Prediction[]> {
    return mockStore.getPredictionsByNode(nodeId);
  }

  async byModel(modelName: string): Promise<Prediction[]> {
    return mockStore.getPredictions().filter((p) => p.model_name === modelName);
  }

  async highRisk(threshold = 80): Promise<Prediction[]> {
    return mockStore.getHighRiskPredictions(threshold);
  }

  async pending(): Promise<Prediction[]> {
    return mockStore.getPendingPredictions();
  }
}

export const predictionService = new PredictionService();
