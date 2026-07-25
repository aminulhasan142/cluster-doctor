import type { HealingRunResult, MigrationCandidate } from "@/types";

/**
 * Builds a human-readable AI explanation sentence from real,
 * already-computed numbers only (plan/migration/recovery objects
 * returned by `/migration/start`). No numbers are invented here —
 * this is string templating over backend-verified data.
 */
export function explainMigrationDecision(
  result: HealingRunResult,
  hostnames: Record<number, string> = {}
): string {
  if (!result.success || !result.plan?.success) {
    return (
      result.reason ??
      result.plan?.reason ??
      "No safe migration target was available — every candidate node was offline or over capacity."
    );
  }

  const { plan, migration, checkpoint, recovery } = result;
  const targetName = hostnames[plan.target_node ?? -1] ?? `Node-${plan.target_node}`;
  const sourceName = hostnames[plan.source_node] ?? `Node-${plan.source_node}`;
  const freeMemory =
    plan.health_score !== undefined && plan.score !== undefined
      ? Math.round(((plan.score - plan.health_score * 0.6) / 0.4) * 100) / 100
      : undefined;

  const parts: string[] = [];

  parts.push(
    `${targetName} was selected as the safe migration target with an AI safety score of ${plan.score}` +
      (plan.health_score !== undefined ? ` (health score ${plan.health_score}` : "") +
      (freeMemory !== undefined ? `, ${freeMemory}% free memory)` : plan.health_score !== undefined ? ")" : "") +
      " — the highest-ranked healthy candidate available."
  );

  if (migration) {
    parts.push(
      `Workload migrated from ${sourceName} to ${targetName}, completing with status "${migration.status}".`
    );
  }

  if (checkpoint) {
    parts.push(
      checkpoint.checkpoint_restored
        ? `Checkpoint restored successfully with ${checkpoint.lost_steps} lost step(s).`
        : `Checkpoint restore failed for workload ${checkpoint.workload_id}.`
    );
  }

  if (recovery) {
    parts.push(
      recovery.status === "recovered"
        ? `Recovery verified: application ${recovery.application_running ? "is running" : "status unknown"}, ${recovery.lost_steps} step(s) lost.`
        : `Recovery verification reported status "${recovery.status}".`
    );
  }

  return parts.join(" ");
}

export function explainCandidateSelection(candidate: MigrationCandidate): string {
  if (!candidate.available) {
    return `${candidate.hostname} is not eligible — node is not currently online.`;
  }

  return (
    `${candidate.hostname} scores ${candidate.safe_score} ` +
    `(health ${candidate.health_score} × 0.6 + ${candidate.free_memory}% free memory × 0.4)` +
    (candidate.is_safest ? " — the safest available target." : ".")
  );
}
