"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Cpu, RefreshCw, Zap, ShieldCheck, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { mockStore } from "@/services/mock-store";
import { broadcastSimulatedEvent } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AISimulatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries();
  };

  const handleSimulateThermal = () => {
    setIsSimulating(true);
    setTimeout(() => {
      mockStore.pushTelemetryReading(102, 94.5, 92.8, 91.2);
      mockStore.updateNode(102, { status: "ONLINE" });
      mockStore.pushNotification({
        title: "CRITICAL: Thermal Runaway Simulated",
        message: "gpu-node-alpha-02 junction temperature spiked to 92.8°C! AI Risk Score: 96.",
        category: "simulation",
        threat_level: "CRITICAL",
        node_id: 102,
        cluster_id: 1,
      });

      broadcastSimulatedEvent({
        event: "prediction",
        timestamp: new Date().toISOString(),
        prediction: { id: 901, node_id: 102, cluster_id: 1, risk_score: 96 },
        notification: {
          id: Date.now(),
          title: "Thermal Runaway Spike",
          message: "Node 102 junction temp reached 92.8°C. AI Guardian recommends workload migration.",
          threat_level: "CRITICAL",
        },
      });

      refreshAll();
      setIsSimulating(false);
      toast.error("Simulated Thermal Spike on gpu-node-alpha-02 (92.8°C)");
    }, 600);
  };

  const handleSimulateOOM = () => {
    setIsSimulating(true);
    setTimeout(() => {
      mockStore.pushTelemetryReading(103, 99.1, 78.0, 98.4);
      mockStore.pushNotification({
        title: "WARNING: High Memory Pressure Simulated",
        message: "edge-node-beta-01 RAM usage reached 98.4%. High probability of kernel OOM panic.",
        category: "simulation",
        threat_level: "HIGH",
        node_id: 103,
        cluster_id: 2,
      });

      refreshAll();
      setIsSimulating(false);
      toast.warning("Simulated RAM Leak on edge-node-beta-01 (98.4%)");
    }, 600);
  };

  const handleRunSelfHealing = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = mockStore.runHealingPipeline(1, 102);
      mockStore.pushNotification({
        title: "Self-Healing Migration Completed",
        message: `Workload on Node 102 migrated to Target Node ${result.plan?.target_node ?? 103} successfully.`,
        category: "self_healing",
        threat_level: "LOW",
        node_id: 102,
        cluster_id: 1,
      });

      refreshAll();
      setIsSimulating(false);
      toast.success("AI Self-Healing Pipeline executed! Workload safely migrated.");
    }, 800);
  };

  const handleResetBaseline = () => {
    mockStore.updateNode(101, { status: "ONLINE", cpu_usage: 45, temperature: 61, memory_usage: 62 });
    mockStore.updateNode(102, { status: "ONLINE", cpu_usage: 50, temperature: 64, memory_usage: 55 });
    mockStore.updateNode(103, { status: "ONLINE", cpu_usage: 40, temperature: 58, memory_usage: 48 });
    mockStore.updateNode(105, { status: "ONLINE", cpu_usage: 35, temperature: 52, memory_usage: 42 });
    refreshAll();
    toast.info("All cluster nodes reset to healthy baseline state.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
          />
        }
      >
        <Sparkles className="size-4 animate-pulse" />
        <span>AI Simulator</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Zap className="size-5 text-amber-400" />
            Live AI Cluster Failure & Healing Simulator
          </DialogTitle>
          <DialogDescription>
            Test real-time AI fault detection, 3D Digital Twin thermal reactions, and autonomous self-healing workflows directly in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-rose-500/20 text-rose-400">
                  <Flame className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Simulate Thermal Runaway</h4>
                  <p className="text-xs text-muted-foreground">Spike Node 102 temperature to 92.8°C</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                disabled={isSimulating}
                onClick={handleSimulateThermal}
              >
                <Play className="mr-1 size-3.5" />
                Trigger
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-secondary/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
                  <Cpu className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Simulate RAM Memory Leak</h4>
                  <p className="text-xs text-muted-foreground">Drive Node 103 RAM pressure to 98.4%</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={isSimulating}
                onClick={handleSimulateOOM}
              >
                <Play className="mr-1 size-3.5" />
                Trigger
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400">Run AI Self-Healing Workflow</h4>
                  <p className="text-xs text-emerald-300/70">Evacuate workload to safe target node</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-500"
                disabled={isSimulating}
                onClick={handleRunSelfHealing}
              >
                <Play className="mr-1 size-3.5" />
                Execute
              </Button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleResetBaseline}
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              Reset All Nodes to Healthy State
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
