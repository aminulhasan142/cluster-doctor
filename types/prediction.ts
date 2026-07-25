export type PredictionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Prediction {
  id: number;
  cluster_id: number;
  node_id: number;
  model_name: string;
  prediction_type: string;
  confidence: number;
  risk_score: number;
  probability: number;
  predicted_label: string;
  recommendation: string | null;
  explanation: string | null;
  status: PredictionStatus;
  predicted_at: string;
  created_at: string;
  updated_at: string;
}
