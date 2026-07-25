import { mockStore } from "./mock-store";
import type { HealingRunResult } from "@/types";

class MigrationService {
  async start(prediction: {
    cluster_id: number;
    node_id: number;
  }): Promise<HealingRunResult> {
    return mockStore.runHealingPipeline(prediction.cluster_id, prediction.node_id);
  }

  async history(): Promise<unknown[]> {
    return [
      {
        migration_id: "mig_9812",
        status: "completed",
        source_node_id: 102,
        target_node_id: 103,
        timestamp: "2026-07-25T11:00:00Z",
      },
    ];
  }

  async details(migrationId: string): Promise<{ migration_id: string; status: string }> {
    return {
      migration_id: migrationId,
      status: "completed",
    };
  }
}

export const migrationService = new MigrationService();
