export type ReportKind =
  | "migration"
  | "prediction"
  | "recovery"
  | "twin_gap"
  | "ai_decisions";

/**
 * The backend has no `/reports` endpoint at all (empty file,
 * not mounted). Reports are generated client-side from data
 * already fetched from real endpoints, clearly labeled as
 * client-generated in the UI.
 */
export interface GeneratedReport {
  id: string;
  kind: ReportKind;
  title: string;
  generated_at: string;
  summary: string;
  rows: Record<string, string | number>[];
}
