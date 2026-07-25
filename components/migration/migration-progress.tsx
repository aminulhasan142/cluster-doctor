"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const STAGES = [
  "Analyzing prediction",
  "Selecting safe target",
  "Migrating workload",
  "Restoring checkpoint",
  "Verifying recovery",
];

/** Visualizes the real (synchronous) backend pipeline as it runs — stage timing is a UX aid, not fabricated data. */
export function MigrationProgress({ running }: { running: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!running) {
      setStage(0);
      return;
    }

    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 500);

    return () => clearInterval(interval);
  }, [running]);

  if (!running) return null;

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      {STAGES.map((label, i) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          {i < stage ? (
            <Check className="size-3.5 text-success" />
          ) : i === stage ? (
            <Loader2 className="size-3.5 animate-spin text-primary" />
          ) : (
            <span className="size-3.5 rounded-full border border-border" />
          )}
          <span className={cn(i <= stage ? "text-foreground" : "text-muted-foreground")}>{label}</span>
        </div>
      ))}
    </div>
  );
}
