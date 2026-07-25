export type ClusterStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "OFFLINE";

export interface Cluster {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  owner_id: number;
  health_score: number;
  status: ClusterStatus;
  created_at: string;
  updated_at: string;
}

export interface ClusterCreateInput {
  name: string;
  description?: string;
  location?: string;
}

export interface ClusterUpdateInput {
  name?: string;
  description?: string;
  location?: string;
  status?: ClusterStatus;
}
