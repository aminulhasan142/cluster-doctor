import type { Prediction } from "./prediction";

/**
 * Safe Target Selection — the candidate that was scored highest.
 * score = health_score * 0.6 + free_memory * 0.4 (backend formula).
 */
export interface MigrationPlan {
  success: boolean;
  source_node: number;
  target_node: number | null;
  health_score?: number;
  score?: number;
  reason?: string;
}

export interface MigrationExecutionResult {
  success: boolean;
  source_node: number;
  target_node: number;
  migrated_at: string;
  status: string;
}

export interface CheckpointResult {
  workload_id: string;
  checkpoint_restored: boolean;
  lost_steps: number;
}

export interface RecoveryVerification {
  success: boolean;
  checkpoint_restored: boolean;
  application_running?: boolean;
  lost_steps: number;
  status: string;
}

export interface HealingRunResult {
  success: boolean;
  reason?: string;
  plan?: MigrationPlan;
  migration?: MigrationExecutionResult;
  checkpoint?: CheckpointResult;
  recovery?: RecoveryVerification;
}

export interface MigrationStartResponse {
  success: boolean;
  result: HealingRunResult;
}

/**
 * Candidate node shown in the Safe Target Selection panel.
 * Built client-side from real Node + latest Telemetry records
 * using the same scoring formula the backend applies, so the
 * ranking shown in the UI matches what `/migration/start` will
 * actually pick.
 */
export interface MigrationCandidate {
  node_id: number;
  hostname: string;
  health_score: number;
  free_memory: number;
  memory_usage: number;
  risk_score: number;
  temperature: number;
  cpu_usage: number;
  gpu_usage: number;
  available: boolean;
  safe_score: number;
  is_safest: boolean;
}

/**
 * Client-side action log entry. The backend does not persist
 * migration history, so each triggered migration is recorded
 * here (session-scoped) with a deterministic, real-number-based
 * AI explanation sentence.
 */
export interface MigrationActionLogEntry {
  id: string;
  timestamp: string;
  cluster_id: number;
  source_node_id: number;
  prediction?: Prediction;
  result: HealingRunResult;
  duration_ms: number;
  explanation: string;
}
