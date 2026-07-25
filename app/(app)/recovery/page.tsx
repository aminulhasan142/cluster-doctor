import { PageHeader } from "@/components/layout/page-header";
import { RecoveryTimeline } from "@/components/recovery/recovery-timeline";
import { ManualRecoveryTrigger } from "@/components/recovery/manual-recovery-trigger";

export default function RecoveryPage() {
  return (
    <div>
      <PageHeader
        title="Recovery Center"
        description="Post-migration recovery verification — checkpoints, restarts, and lost work."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <RecoveryTimeline />
        <ManualRecoveryTrigger />
      </div>
    </div>
  );
}
