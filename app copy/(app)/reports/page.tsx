"use client";

import { useState } from "react";
import { Download, FileBarChart2, Printer } from "lucide-react";

import { useAllPredictions } from "@/hooks/use-predictions";
import { useNodes } from "@/hooks/use-node";
import { useComputedRealitySummary } from "@/hooks/use-reality";
import { useMigrationLogStore } from "@/store/migration-log-store";
import { useCriticalNotifications } from "@/hooks/use-notifications";
import { formatDateTime } from "@/lib/format";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/state";
import { DataSourceBadge } from "@/components/common/data-source-badge";
import type { GeneratedReport, ReportKind } from "@/types";

export default function ReportsPage() {
  const { data: predictions } = useAllPredictions();
  const { data: nodes } = useNodes();
  const { data: realitySummary } = useComputedRealitySummary(nodes ?? []);
  const migrationEntries = useMigrationLogStore((s) => s.entries);
  const { data: criticalNotifications } = useCriticalNotifications();

  const [reports, setReports] = useState<GeneratedReport[]>([]);

  const generate = (kind: ReportKind) => {
    let report: GeneratedReport;
    const now = new Date().toISOString();

    switch (kind) {
      case "prediction":
        report = {
          id: crypto.randomUUID(),
          kind,
          title: "Prediction Report",
          generated_at: now,
          summary: `${predictions?.length ?? 0} predictions on record. ${
            predictions?.filter((p) => p.risk_score >= 75).length ?? 0
          } at critical risk.`,
          rows: (predictions ?? []).map((p) => ({
            Node: p.node_id,
            Model: p.model_name,
            Label: p.predicted_label,
            "Risk %": p.risk_score,
            Status: p.status,
          })),
        };
        break;
      case "migration":
        report = {
          id: crypto.randomUUID(),
          kind,
          title: "Migration Report",
          generated_at: now,
          summary: `${migrationEntries.length} migration action(s) triggered this session.`,
          rows: migrationEntries.map((e) => ({
            Time: formatDateTime(e.timestamp),
            Source: e.source_node_id,
            Target: e.result.plan?.target_node ?? "—",
            "Safe Score": e.result.plan?.score ?? "—",
            Status: e.result.recovery?.status ?? (e.result.success ? "completed" : "failed"),
          })),
        };
        break;
      case "recovery":
        report = {
          id: crypto.randomUUID(),
          kind,
          title: "Recovery Report",
          generated_at: now,
          summary: `${migrationEntries.filter((e) => e.result.recovery).length} recovery confirmation(s) recorded.`,
          rows: migrationEntries
            .filter((e) => e.result.recovery)
            .map((e) => ({
              Time: formatDateTime(e.timestamp),
              Node: e.source_node_id,
              Checkpoint: e.result.checkpoint?.checkpoint_restored ? "Restored" : "Failed",
              "Lost Steps": e.result.checkpoint?.lost_steps ?? 0,
              Status: e.result.recovery?.status ?? "—",
            })),
        };
        break;
      case "twin_gap":
        report = {
          id: crypto.randomUUID(),
          kind,
          title: "Twin Reality Gap Report",
          generated_at: now,
          summary: `${realitySummary?.healthy_nodes ?? 0} healthy, ${realitySummary?.warning_nodes ?? 0} gap-warning, ${
            realitySummary?.no_snapshot_nodes ?? 0
          } without a twin snapshot yet.`,
          rows: (realitySummary?.records ?? []).map((r) => ({
            Node: r.node_id,
            "Avg Gap %": r.result.average_gap ?? "—",
            "Avg Confidence %": r.result.average_accuracy ?? "—",
            Status: r.result.status ?? (r.result.success ? "—" : "no snapshot"),
          })),
        };
        break;
      case "ai_decisions":
        report = {
          id: crypto.randomUUID(),
          kind,
          title: "AI Decisions Report",
          generated_at: now,
          summary: `${migrationEntries.length} AI-driven action(s) and ${
            criticalNotifications?.length ?? 0
          } critical alert(s) this session.`,
          rows: migrationEntries.map((e) => ({
            Time: formatDateTime(e.timestamp),
            Decision: e.explanation,
          })),
        };
        break;
    }

    setReports((prev) => [report, ...prev]);
  };

  const download = (report: GeneratedReport) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.kind}-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const REPORT_KINDS: { kind: ReportKind; label: string }[] = [
    { kind: "prediction", label: "Prediction" },
    { kind: "migration", label: "Migration" },
    { kind: "recovery", label: "Recovery" },
    { kind: "twin_gap", label: "Twin Gap" },
    { kind: "ai_decisions", label: "AI Decisions" },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generated on-device from the data currently loaded — the backend has no reports API yet."
      />

      <Card className="glass-panel mb-4">
        <CardContent className="flex flex-wrap items-center gap-2 pt-4">
          <DataSourceBadge source="computed" />
          {REPORT_KINDS.map(({ kind, label }) => (
            <Button key={kind} size="sm" variant="outline" onClick={() => generate(kind)}>
              <FileBarChart2 className="size-3.5" />
              Generate {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {reports.length === 0 && (
        <EmptyState title="No reports generated yet" description="Choose a report type above to generate one." />
      )}

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="glass-panel">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>{report.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(report.generated_at)} · {report.summary}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => download(report)}>
                  <Download className="size-3.5" />
                  JSON
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="size-3.5" />
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {report.rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rows to display.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(report.rows[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.rows.map((row, i) => (
                      <TableRow key={i}>
                        {Object.values(row).map((value, j) => (
                          <TableCell key={j}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
