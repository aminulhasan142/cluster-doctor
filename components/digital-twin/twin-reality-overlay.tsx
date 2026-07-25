"use client";

import { Eye, EyeOff, ShieldAlert, Cpu, Thermometer, Layers, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface TwinRealityOverlayProps {
  showGhostOverlay: boolean;
  onToggleGhostOverlay: (show: boolean) => void;
  twinGapData: {
    cpuDriftPct: number;
    thermalDriftC: number;
    ramVariancePct: number;
    confidencePct: number;
    status: "MATCHED" | "DRIFT_DETECTED" | "CRITICAL_MISMATCH";
  };
}

export function TwinRealityOverlay({
  showGhostOverlay,
  onToggleGhostOverlay,
  twinGapData,
}: TwinRealityOverlayProps) {
  const getStatusBadge = () => {
    switch (twinGapData.status) {
      case "MATCHED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <CheckCircle2 className="size-3" /> Reality Synced (100%)
          </span>
        );
      case "DRIFT_DETECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
            <ShieldAlert className="size-3" /> Minor Drift (+4.2%)
          </span>
        );
      case "CRITICAL_MISMATCH":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
            <ShieldAlert className="size-3" /> Anomaly Gap Detected
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 bg-black/75 p-4 backdrop-blur-xl shadow-xl w-full max-w-sm space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-cyan-400 animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Twin Reality Check
          </h4>
        </div>
        {getStatusBadge()}
      </div>

      {/* Ghost Overlay Toggle */}
      <div className="flex items-center justify-between bg-white/5 rounded-lg p-2.5">
        <div className="flex items-center gap-2 text-xs">
          {showGhostOverlay ? (
            <Eye className="size-4 text-cyan-400" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" />
          )}
          <span>Holographic Ghost Nodes</span>
        </div>
        <Switch checked={showGhostOverlay} onCheckedChange={onToggleGhostOverlay} />
      </div>

      {/* Twin Gap Variance Matrix */}
      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Twin Gap Variance Matrix
        </p>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-white/5 bg-secondary/30 p-2">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Cpu className="size-3 text-sky-400" /> CPU Drift
            </div>
            <p className="mt-1 font-mono font-semibold text-foreground">
              +{twinGapData.cpuDriftPct.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-secondary/30 p-2">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Thermometer className="size-3 text-rose-400" /> Thermal
            </div>
            <p className="mt-1 font-mono font-semibold text-rose-400">
              +{twinGapData.thermalDriftC.toFixed(1)}°C
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-secondary/30 p-2">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              Confidence
            </div>
            <p className="mt-1 font-mono font-semibold text-emerald-400">
              {twinGapData.confidencePct}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
