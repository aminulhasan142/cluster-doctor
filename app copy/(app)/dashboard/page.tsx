"use client";

import { Activity, Boxes, HeartPulse, Network, ShieldAlert } from "lucide-react";

import { useDashboardOverview } from "@/hooks/use-dashboard";
import { formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

import { ClusterHealthCard } from "@/components/dashboard/cluster-health-card";
import { PredictionCard } from "@/components/dashboard/prediction-card";
import { RiskCard } from "@/components/dashboard/risk-card";
import { TwinGapCard } from "@/components/dashboard/twin-gap-card";
import { SafeTargetCard } from "@/components/dashboard/safe-target-card";
import { RecoveryCard } from "@/components/dashboard/recovery-card";
import { AISummaryCard } from "@/components/dashboard/ai-summary-card";
import { AlertsCard } from "@/components/dashboard/alerts-card";
import { TelemetryCard } from "@/components/dashboard/telemetry-card";

function Kpi({
  icon: Icon,
  label,
  value,
  tone = "text-foreground",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="glass-panel flex items-center gap-3 rounded-xl px-4 py-3.5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className={`text-lg font-semibold tabular-nums ${tone}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: overview, isLoading } = useDashboardOverview();

  return (
    <div>
      <PageHeader
        title="Mission Control"
        description="Real-time overview of every cluster your AI is watching."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
          ))
        ) : (
          <>
            <Kpi icon={Boxes} label="Clusters" value={String(overview?.clusters ?? 0)} />
            <Kpi icon={Network} label="Nodes" value={String(overview?.nodes ?? 0)} />
            <Kpi
              icon={HeartPulse}
              label="System Health"
              value={formatPercent(overview?.system_health, 0)}
              tone="text-success"
            />
            <Kpi
              icon={ShieldAlert}
              label="Critical Clusters"
              value={String(overview?.critical_clusters ?? 0)}
              tone={overview && overview.critical_clusters > 0 ? "text-danger" : undefined}
            />
            <Kpi
              icon={Activity}
              label="Pending Predictions"
              value={String(overview?.pending_predictions ?? 0)}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ClusterHealthCard />
        <PredictionCard />
        <RiskCard />
        <TwinGapCard />
        <SafeTargetCard />
        <RecoveryCard />
        <AISummaryCard />
        <AlertsCard />
        <TelemetryCard />
      </div>
    </div>
  );
}
