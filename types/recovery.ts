/**
 * `/recovery/*` — thin, stubbed backend router (kept honest in the UI;
 * see services/recovery.service.ts for how this is combined with the
 * richer `recovery` object returned by `/migration/start`).
 */
export interface RecoveryStartResponse {
  node_id: string;
  status: string;
  message: string;
}

export interface RecoveryStatusResponse {
  node_id: string;
  status: string;
}

export interface RecoveryHistoryResponse {
  node_id: string;
  history: unknown[];
}
