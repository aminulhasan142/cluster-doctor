"use client";

import { ShieldCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClusterNode } from "@/types";

export interface CandidateTargetScore {
  node: ClusterNode;
  safeScore: number; // 0 - 100
  thermalHeadroom: number;
  freeRamGb: number;
  isSafest: boolean;
}

export function computeSafeScores(
  nodes: ClusterNode[],
  sourceNodeId: number
): CandidateTargetScore[] {
  const candidates = nodes.filter((n) => n.id !== sourceNodeId && n.status === "ONLINE");

  return candidates
    .map((node) => {
      const thermalHeadroom = Math.max(0, 100 - node.temperature);
      const freeRamGb = Math.max(0, node.ram_gb * (1 - node.memory_usage / 100));

      const thermalScore = (thermalHeadroom / 50) * 40; // max 40 pts
      const ramScore = (node.memory_usage < 80 ? 40 : 10); // max 40 pts
      const statusScore = node.status === "ONLINE" ? 20 : 0; // 20 pts

      const safeScore = Math.min(99, Math.max(10, Math.round(thermalScore + ramScore + statusScore)));

      return {
        node,
        safeScore,
        thermalHeadroom: Math.round(thermalHeadroom),
        freeRamGb: Math.round(freeRamGb),
        isSafest: false,
      };
    })
    .sort((a, b) => b.safeScore - a.safeScore)
    .map((c, i) => ({ ...c, isSafest: i === 0 }));
}

interface SafeTargetDragLayerProps {
  sourceNode: ClusterNode | null;
  candidates: CandidateTargetScore[];
  selectedTargetId: number | null;
  onSelectTarget: (targetId: number) => void;
  onCommitMigration: () => void;
  isMigrating: boolean;
}

export function SafeTargetDragLayer({
  sourceNode,
  candidates,
  selectedTargetId,
  onSelectTarget,
  onCommitMigration,
  isMigrating,
}: SafeTargetDragLayerProps) {
  if (!sourceNode) return null;

  return (
    <div className="glass-panel rounded-2xl border border-sky-500/30 bg-black/80 p-4 backdrop-blur-xl shadow-2xl w-full max-w-sm space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-400 animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Safe Target Selector & Migration
          </h4>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
          AI Guided
        </span>
      </div>

      <div className="rounded-lg bg-white/5 p-2.5 text-xs flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Evacuating Source</p>
          <p className="font-semibold text-rose-400">{sourceNode.hostname}</p>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Selected Target</p>
          <p className="font-semibold text-emerald-400">
            {candidates.find((c) => c.node.id === selectedTargetId)?.node.hostname ?? "Click Candidate"}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Ranked Candidate Targets
        </p>

        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {candidates.map((c) => {
            const isSelected = c.node.id === selectedTargetId;
            return (
              <div
                key={c.node.id}
                onClick={() => onSelectTarget(c.node.id)}
                className={`cursor-pointer rounded-xl border p-2.5 text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30"
                    : c.isSafest
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-white/5 bg-secondary/20 hover:bg-secondary/40"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">{c.node.hostname}</span>
                    {c.isSafest && (
                      <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400">
                        TOP SAFE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Temp: {c.node.temperature}°C · Free RAM: {c.freeRamGb}GB
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Zap className={`size-3 ${c.isSafest ? "text-amber-400" : "text-muted-foreground"}`} />
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {c.safeScore}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">AI Safe Score</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5 h-9 shadow-lg"
        disabled={!selectedTargetId || isMigrating}
        onClick={onCommitMigration}
      >
        <CheckCircle2 className="size-4" />
        {isMigrating ? "Executing Self-Healing..." : "Commit Autonomous Workload Migration"}
      </Button>
    </div>
  );
}
