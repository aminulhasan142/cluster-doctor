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
  { time: -12, label: "Tensor Leak", color: "bg-amber-500" },
  { time: -6, label: "Fan Throttle", color: "bg-orange-500" },
  { time: 0, label: "Real-Time", color: "bg-emerald-500" },
  { time: 5, label: "VRM Spike", color: "bg-rose-500" },
  { time: 12, label: "OOM Crash", color: "bg-red-600" },
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
    if (offset < 0) return `${Math.abs(offset)}m Replay`;
    return `+${offset}m AI Future`;
  };

  return (
    <div className="glass-panel w-full rounded-xl border border-white/10 bg-black/75 p-3.5 backdrop-blur-xl shadow-2xl space-y-2.5">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <Clock className="size-3.5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-foreground flex items-center gap-2">
              Temporal What-If Sandbox
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400 border border-sky-500/20">
                {getTimeLabel(timeOffset)}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Button
            size="sm"
            variant={scenarioMode === "default" ? "destructive" : "outline"}
            className="text-xs h-7 px-2.5"
            onClick={() => onToggleScenario("default")}
          >
            <AlertTriangle className="mr-1 size-3" />
            Unchecked Future
          </Button>
          <Button
            size="sm"
            variant={scenarioMode === "healed" ? "default" : "outline"}
            className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={() => onToggleScenario("healed")}
          >
            <Sparkles className="mr-1 size-3" />
            Auto-Healed
          </Button>
        </div>
      </div>

      {/* Time Slider Bar */}
      <div className="relative py-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span className="text-amber-400 font-semibold">-15m Root Cause</span>
          <span className="text-emerald-400 font-bold">0m Real-Time</span>
          <span className="text-rose-400 font-semibold">+15m AI Future</span>
        </div>

        <input
          type="range"
          min="-15"
          max="15"
          step="1"
          value={timeOffset}
          onChange={(e) => onChangeTimeOffset(Number(e.target.value))}
          className="w-full accent-sky-400 cursor-pointer h-1.5 rounded-lg bg-secondary/60"
        />

        {/* Keyframe Markers */}
        <div className="relative mt-1.5 h-4 w-full">
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
                <span className={`size-2 rounded-full ${kf.color} ring-1 ring-black`} />
                <span className="hidden group-hover:block absolute top-3.5 whitespace-nowrap rounded bg-popover px-1.5 py-0.5 text-[9px] font-mono text-popover-foreground border border-border shadow-md">
                  {kf.time > 0 ? `+${kf.time}m` : `${kf.time}m`}: {kf.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 font-mono text-xs">
        <div className="flex items-center gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onChangeTimeOffset(-15)}
            title="Reset to -15m"
          >
            <RotateCcw className="size-3" />
          </Button>

          <Button
            size="icon-xs"
            variant="secondary"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
          </Button>

          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onChangeTimeOffset(15)}
            title="Jump to +15m"
          >
            <FastForward className="size-3" />
          </Button>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground">
          Trajectory: <span className="text-foreground uppercase font-bold">{scenarioMode}</span> · Offset:{" "}
          <span className="text-sky-400 font-bold">{timeOffset > 0 ? `+${timeOffset}` : timeOffset}m</span>
        </div>
      </div>
    </div>
  );
}
