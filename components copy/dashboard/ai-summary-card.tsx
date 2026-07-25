"use client";

import { useQuery } from "@tanstack/react-query";
import { BrainCircuit } from "lucide-react";

import { useDashboardOverview } from "@/hooks/use-dashboard";
import { chatbotService } from "@/services/chatbot.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSourceBadge } from "@/components/common/data-source-badge";
import { EmptyState } from "@/components/common/state";
import type { DashboardOverview } from "@/types";

function deterministicSummary(o: DashboardOverview): string {
  const clusterWord = o.clusters === 1 ? "cluster" : "clusters";
  const nodeWord = o.nodes === 1 ? "node" : "nodes";

  if (o.critical_clusters > 0) {
    return `${o.critical_clusters} of ${o.clusters} ${clusterWord} are in a critical state with ${o.pending_predictions} prediction(s) pending review. System health is at ${o.system_health}% — recommend opening the Migration Center for at-risk nodes.`;
  }

  if (o.warning_clusters > 0 || o.critical_notifications > 0) {
    return `Overall system health is ${o.system_health}% across ${o.clusters} ${clusterWord} and ${o.nodes} ${nodeWord}. ${o.warning_clusters} cluster(s) need attention and ${o.critical_notifications} critical alert(s) are unread.`;
  }

  return `All ${o.clusters} ${clusterWord} and ${o.online_nodes}/${o.nodes} ${nodeWord} are online and healthy. System health is ${o.system_health}% with no pending high-risk predictions.`;
}

export function AISummaryCard() {
  const { data: overview } = useDashboardOverview();

  const { data, isLoading } = useQuery({
    queryKey: ["ai-summary", overview?.system_health, overview?.critical_clusters, overview?.pending_predictions],
    queryFn: async () => {
      if (!overview) throw new Error("no overview");

      try {
        const answer = await chatbotService.send({
          question:
            "In two sentences, summarize the current cluster status for an operator glancing at a dashboard.",
          telemetry: overview,
        });
        return { text: answer.answer, source: "live" as const };
      } catch {
        return { text: deterministicSummary(overview), source: "computed" as const };
      }
    },
    enabled: !!overview,
    staleTime: 60_000,
    retry: false,
  });

  return (
    <Card className="glass-panel gap-3 border-[var(--ai)]/20 bg-gradient-to-br from-[var(--ai)]/[0.06] to-transparent">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="size-4 text-[var(--ai)]" />
          AI Summary
        </CardTitle>
        {data && <DataSourceBadge source={data.source} />}
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-16 w-full rounded-lg" />}
        {!isLoading && !overview && (
          <EmptyState title="Summary unavailable" description="Dashboard data is required to generate a summary." />
        )}
        {data && <p className="text-sm leading-relaxed text-foreground/90">{data.text}</p>}
      </CardContent>
    </Card>
  );
}
