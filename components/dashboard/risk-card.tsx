"use client";

import { Activity } from "lucide-react";

import { useAllPredictions } from "@/hooks/use-predictions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bucketPredictionsByRisk, RiskDistributionChart } from "@/components/charts/risk-distribution";
import { EmptyState } from "@/components/common/state";

export function RiskCard() {
  const { data, isLoading } = useAllPredictions();

  return (
    <Card className="glass-panel gap-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-36 w-full rounded-lg" />}
        {!isLoading && (!data || data.length === 0) && (
          <EmptyState title="No prediction data yet" description="Seed telemetry to generate AI predictions." />
        )}
        {data && data.length > 0 && <RiskDistributionChart data={bucketPredictionsByRisk(data)} />}
      </CardContent>
    </Card>
  );
}
