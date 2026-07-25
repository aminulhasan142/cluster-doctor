"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { useHighRiskPredictions } from "@/hooks/use-predictions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/state";

export function PredictionCard() {
  const { data, isLoading } = useHighRiskPredictions(70);

  return (
    <Card className="glass-panel gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--ai)]" />
          Predicted Failures
        </CardTitle>
        <Badge variant="outline">{data?.length ?? 0} at risk</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <Skeleton className="h-24 w-full rounded-lg" />}
        {!isLoading && (!data || data.length === 0) && (
          <EmptyState
            title="No elevated-risk predictions"
            description="Every node is currently predicted healthy."
          />
        )}
        {data?.slice(0, 4).map((p) => (
          <Link
            key={p.id}
            href="/predictions"
            className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-white/5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{p.predicted_label}</p>
              <p className="text-xs text-muted-foreground">
                Node #{p.node_id} · {p.model_name}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-danger tabular-nums">
              {p.risk_score.toFixed(0)}%
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
