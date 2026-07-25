"use client";

import { Eye, EyeOff, ShieldAlert, Layers, CheckCircle2 } from "lucide-react";
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
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
            <CheckCircle2 className="size-3" /> Synced 100%
          </span>
        );
      case "DRIFT_DETECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400">
            <ShieldAlert className="size-3" /> Drift +4.2%
          </span>
        );
      case "CRITICAL_MISMATCH":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400">
            <ShieldAlert className="size-3" /> Anomaly Gap
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur-xl shadow-2xl w-full max-w-[280px] space-y-2.5">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <Layers className="size-3.5 text-cyan-400 animate-pulse" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-foreground">
            Twin Reality
          </h4>
        </div>
        {getStatusBadge()}
      </div>

      {/* Ghost Overlay Toggle */}
      <div className="flex items-center justify-between bg-white/5 rounded-lg px-2.5 py-1.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          {showGhostOverlay ? (
            <Eye className="size-3.5 text-cyan-400" />
          ) : (
            <EyeOff className="size-3.5 text-muted-foreground" />
          )}
          <span>Holographic Ghost</span>
        </div>
        <Switch checked={showGhostOverlay} onCheckedChange={onToggleGhostOverlay} />
      </div>

      {/* Twin Gap Variance Matrix */}
      <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
        <div className="rounded-lg border border-white/5 bg-white/5 p-1.5">
          <p className="text-[9px] text-muted-foreground">CPU Drift</p>
          <p className="font-semibold text-foreground mt-0.5">+{twinGapData.cpuDriftPct.toFixed(1)}%</p>
        </div>

        <div className="rounded-lg border border-white/5 bg-white/5 p-1.5">
          <p className="text-[9px] text-muted-foreground">Thermal</p>
          <p className="font-semibold text-rose-400 mt-0.5">+{twinGapData.thermalDriftC.toFixed(1)}°C</p>
        </div>

        <div className="rounded-lg border border-white/5 bg-white/5 p-1.5">
          <p className="text-[9px] text-muted-foreground">Confidence</p>
          <p className="font-semibold text-emerald-400 mt-0.5">{twinGapData.confidencePct}%</p>
        </div>
      </div>
    </div>
  );
}
