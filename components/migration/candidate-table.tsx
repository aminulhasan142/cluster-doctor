import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MigrationCandidate } from "@/types";

export function CandidateTable({ candidates }: { candidates: MigrationCandidate[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Node</TableHead>
          <TableHead>Availability</TableHead>
          <TableHead>Health</TableHead>
          <TableHead>Free Mem</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead>Temp</TableHead>
          <TableHead>CPU</TableHead>
          <TableHead>GPU</TableHead>
          <TableHead>AI Safe Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((c) => (
          <TableRow
            key={c.node_id}
            className={cn(c.is_safest && "bg-success/5 hover:bg-success/10")}
          >
            <TableCell className="font-medium text-foreground">
              <div className="flex items-center gap-1.5">
                {c.is_safest && <ShieldCheck className="size-3.5 text-success" />}
                {c.hostname}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  c.available
                    ? "border-success/25 bg-success/10 text-success"
                    : "border-border bg-muted text-muted-foreground"
                }
              >
                {c.available ? "Online" : "Unavailable"}
              </Badge>
            </TableCell>
            <TableCell className="tabular-nums">{c.health_score}</TableCell>
            <TableCell className="tabular-nums">{c.free_memory}%</TableCell>
            <TableCell className="tabular-nums">{c.risk_score}</TableCell>
            <TableCell className="tabular-nums">{c.temperature.toFixed(0)}°C</TableCell>
            <TableCell className="tabular-nums">{c.cpu_usage.toFixed(0)}%</TableCell>
            <TableCell className="tabular-nums">{c.gpu_usage.toFixed(0)}%</TableCell>
            <TableCell>
              <span className={cn("font-semibold tabular-nums", c.is_safest ? "text-success" : "text-foreground")}>
                {c.safe_score}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
