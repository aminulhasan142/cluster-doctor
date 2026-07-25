export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type NotificationStatus = "UNREAD" | "READ";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  category: string;
  threat_level: ThreatLevel;
  user_id: number;
  cluster_id: number | null;
  node_id: number | null;
  prediction_id: number | null;
  status: NotificationStatus;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}
