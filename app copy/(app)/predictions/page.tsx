"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCcw, Wand2 } from "lucide-react";

import { useAllPredictions } from "@/hooks/use-predictions";
import { formatDateTime, formatPercent, statusToTone } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/common/state";
import { StatusBadge } from "@/components/common/status";

const THRESHOLDS = [
  { value: "0", label: "All predictions" },
  { value: "50", label: "Risk ≥ 50%" },
  { value: "70", label: "Risk ≥ 70%" },
  { value: "90", label: "Risk ≥ 90%" },
];

function riskTone(score: number) {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "WARNING";
  return "HEALTHY";
}

export default function PredictionsPage() {
  const [threshold, setThreshold] = useState("0");
  const { data, isLoading, isError, refetch } = useAllPredictions(Number(threshold));

  const sorted = [...(data ?? [])].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div>
      <PageHeader
        title="Predictions"
        description="Every AI failure/anomaly/experiment-risk prediction, ranked by risk."
        actions={
          <>
            <Select value={threshold} onValueChange={(v) => setThreshold(v ?? "0")}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THRESHOLDS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="size-3.5" />
              Refresh
            </Button>
          </>
        }
      />

      <Card className="glass-panel">
        <CardContent>
          {isLoading && <LoadingBlock rows={5} />}
          {isError && <ErrorState onRetry={() => refetch()} message="Could not load predictions." />}
          {!isLoading && !isError && sorted.length === 0 && (
            <EmptyState
              title="No predictions match this threshold"
              description="Lower the threshold or seed telemetry to generate new predictions."
            />
          )}
          {sorted.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Node</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Predicted</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-foreground">#{p.node_id}</TableCell>
                    <TableCell className="text-muted-foreground">{p.model_name}</TableCell>
                    <TableCell>{p.predicted_label}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusToTone(riskTone(p.risk_score)) === "danger"
                            ? "border-danger/25 bg-danger/10 text-danger"
                            : statusToTone(riskTone(p.risk_score)) === "warning"
                              ? "border-warning/25 bg-warning/10 text-warning"
                              : "border-success/25 bg-success/10 text-success"
                        }
                      >
                        {formatPercent(p.risk_score, 0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatPercent(p.confidence, 0)}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(p.predicted_at)}
                    </TableCell>
                    <TableCell>
                      {p.risk_score >= 50 && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Open in Migration Center"
                          nativeButton={false}
                          render={<Link href={`/migration?predictionId=${p.id}`} />}
                        >
                          <Wand2 className="size-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
