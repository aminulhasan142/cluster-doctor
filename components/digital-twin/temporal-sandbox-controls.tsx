"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, FastForward, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemporalSandboxControlsProps {
  timeOffset: number; // in minutes (-15 to +15)
  onChangeTimeOffset: (offset: number) => void;
  scenarioMode: "default" | "healed";
  onToggleScenario: (mode: "default" | "healed") => void;
}

const KEYFRAMES = [
  { time: -12, label: "PyTorch Tensor Leak", color: "bg-amber-500" },
  { time: -6, label: "Fan Controller Throttling", color: "bg-orange-500" },
  { time: 0, label: "Present Real-Time State", color: "bg-emerald-500" },
  { time: 5, label: "Predicted VRM Junction Spike", color: "bg-rose-500" },
  { time: 12, label: "Uncontrolled OOM Crash", color: "bg-red-600" },
];

export function TemporalSandboxControls({
  timeOffset,
  onChangeTimeOffset,
  scenarioMode,
  onToggleScenario,
}: TemporalSandboxControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (timeOffset >= 15) {
        setIsPlaying(false);
      } else {
        onChangeTimeOffset(timeOffset + 1);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying, timeOffset, onChangeTimeOffset]);

  const getTimeLabel = (offset: number) => {
    if (offset === 0) return "NOW (Real-Time)";
    if (offset < 0) return `${Math.abs(offset)}m ago (Past Root-Cause Replay)`;
    return `+${offset}m in future (AI Predicted State)`;
  };

  return (
    <div className="glass-panel w-full rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <Clock className="size-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Temporal AI What-If Sandbox
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400 border border-sky-500/20">
                {getTimeLabel(timeOffset)}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Scrub backward to replay root cause anomalies or forward to inspect simulated future states.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={scenarioMode === "default" ? "destructive" : "outline"}
            className="text-xs h-7"
            onClick={() => onToggleScenario("default")}
          >
            <AlertTriangle className="mr-1 size-3" />
            Unchecked Trajectory
          </Button>
          <Button
            size="sm"
            variant={scenarioMode === "healed" ? "default" : "outline"}
            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={() => onToggleScenario("healed")}
          >
            <Sparkles className="mr-1 size-3" />
            Post-Healing Future
          </Button>
        </div>
      </div>

      {/* Time Slider Bar */}
      <div className="relative py-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1">
          <span className="text-amber-400">-15m (Past Root Cause)</span>
          <span className="text-emerald-400 font-bold">0m (Present Real-Time)</span>
          <span className="text-rose-400">+15m (AI Simulated Future)</span>
        </div>

        <input
          type="range"
          min="-15"
          max="15"
          step="1"
          value={timeOffset}
          onChange={(e) => onChangeTimeOffset(Number(e.target.value))}
          className="w-full accent-sky-400 cursor-pointer h-2 rounded-lg bg-secondary/60"
        />

        {/* Keyframe Markers */}
        <div className="relative mt-2 h-6 w-full">
          {KEYFRAMES.map((kf) => {
            const pct = ((kf.time + 15) / 30) * 100;
            return (
              <button
                key={kf.time}
                onClick={() => onChangeTimeOffset(kf.time)}
                style={{ left: `${pct}%` }}
                className="absolute -translate-x-1/2 flex flex-col items-center group"
                title={`${kf.time}m: ${kf.label}`}
              >
                <span className={`size-2.5 rounded-full ${kf.color} ring-2 ring-black`} />
                <span className="hidden group-hover:block absolute top-4 whitespace-nowrap rounded bg-popover px-1.5 py-0.5 text-[9px] text-popover-foreground border border-border shadow-md">
                  {kf.time > 0 ? `+${kf.time}m` : `${kf.time}m`}: {kf.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onChangeTimeOffset(-15)}
            title="Reset to -15m"
          >
            <RotateCcw className="size-3.5" />
          </Button>

          <Button
            size="icon-xs"
            variant="secondary"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onChangeTimeOffset(15)}
            title="Jump to +15m"
          >
            <FastForward className="size-3.5" />
          </Button>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Mode: <span className="text-foreground uppercase font-bold">{scenarioMode}</span> · Offset:{" "}
          <span className="text-sky-400 font-bold">{timeOffset > 0 ? `+${timeOffset}` : timeOffset}m</span>
        </div>
      </div>
    </div>
  );
}
