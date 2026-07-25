"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Sparkles, ShieldCheck, Layers } from "lucide-react";
import { toast } from "sonner";

import { useNodes } from "@/hooks/use-node";
import { useHighRiskPredictions } from "@/hooks/use-predictions";
import { useMigrationLogStore } from "@/store/migration-log-store";
import { mockStore } from "@/services/mock-store";
import { simulatorService } from "@/services/simulator.service";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingBlock } from "@/components/common/state";
import { NodeInspector } from "@/components/digital-twin/node-inspector";
import { RealityPanel } from "@/components/digital-twin/reality-panel";
import { RecoveryPanel } from "@/components/digital-twin/recovery-panel";
import { TemporalSandboxControls } from "@/components/digital-twin/temporal-sandbox-controls";
import { TwinRealityOverlay } from "@/components/digital-twin/twin-reality-overlay";
import {
  HolographicHudOverlay,
  NodeScreenPoint,
} from "@/components/digital-twin/holographic-hud-overlay";
import {
  SafeTargetDragLayer,
  computeSafeScores,
} from "@/components/digital-twin/safe-target-drag-layer";

const Room = dynamic(() => import("@/components/digital-twin/room").then((m) => m.Room), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  ),
});

export default function DigitalTwinPage() {
  const { data: nodes, isLoading, isError, refetch } = useNodes();
  const { data: highRisk } = useHighRiskPredictions(50);
  const latestMigration = useMigrationLogStore((s) => s.entries[0]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  // Temporal Sandbox State
  const [timeOffset, setTimeOffset] = useState(0);
  const [scenarioMode, setScenarioMode] = useState<"default" | "healed">("default");
  const [showGhostOverlay, setShowGhostOverlay] = useState(true);

  // Safe Target Migration Mode State
  const [isMigrationMode, setIsMigrationMode] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(103);
  const [isMigrating, setIsMigrating] = useState(false);

  // Screen Projected Points for Leader Lines
  const [nodeScreenPoints, setNodeScreenPoints] = useState<NodeScreenPoint[]>([]);

  const riskByNodeId = useMemo(() => {
    const map: Record<number, number> = {};
    for (const p of highRisk ?? []) {
      if (!map[p.node_id] || map[p.node_id] < p.risk_score) map[p.node_id] = p.risk_score;
    }
    return map;
  }, [highRisk]);

  const migrationArc = useMemo(() => {
    if (!latestMigration?.result.plan?.target_node) return null;
    const age = Date.now() - new Date(latestMigration.timestamp).getTime();
    if (age > 60_000) return null;
    return {
      sourceNodeId: latestMigration.source_node_id,
      targetNodeId: latestMigration.result.plan.target_node,
    };
  }, [latestMigration]);

  const selectedNode = nodes?.find((n) => n.id === selectedNodeId) ?? nodes?.find((n) => n.id === 102) ?? null;

  const candidateScores = useMemo(() => {
    if (!nodes) return [];
    return computeSafeScores(nodes, selectedNode?.id ?? 102);
  }, [nodes, selectedNode]);

  const twinGapData = useMemo(() => {
    const isAnomalous = (nodes?.find((n) => n.id === 102)?.temperature ?? 0) > 85 || timeOffset > 0;
    return {
      cpuDriftPct: isAnomalous ? 4.2 : 0.8,
      thermalDriftC: isAnomalous ? 2.4 : 0.4,
      ramVariancePct: isAnomalous ? 3.1 : 0.5,
      confidencePct: 96.4,
      status: (isAnomalous ? "CRITICAL_MISMATCH" : "MATCHED") as "MATCHED" | "CRITICAL_MISMATCH",
    };
  }, [nodes, timeOffset]);

  const handleCommitMigration = () => {
    if (!selectedTargetId) return;
    setIsMigrating(true);
    setTimeout(() => {
      mockStore.runHealingPipeline(1, selectedNode?.id ?? 102);
      setScenarioMode("healed");
      setTimeOffset(5);
      refetch();
      setIsMigrating(false);
      toast.success(`Autonomous Migration Executed! Workload transferred to Node ${selectedTargetId}`);
    }, 800);
  };

  const seedDemoData = async () => {
    try {
      await simulatorService.publish();
      toast.success("Telemetry published — AI pipeline is processing it now.");
      setTimeout(() => refetch(), 1000);
    } catch {
      toast.error("Could not reach the simulator endpoint.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Temporal AI Sandbox & Holographic Twin"
        description="Collision-free leader-line HUD overlay, 3D radar sonar pulse rings, and what-if time scrubbing."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isMigrationMode ? "default" : "outline"}
              className={isMigrationMode ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""}
              onClick={() => setIsMigrationMode(!isMigrationMode)}
            >
              <ShieldCheck className="size-3.5 mr-1" />
              {isMigrationMode ? "Exit Migration Mode" : "Safe Target Migration"}
            </Button>
            <Button
              size="sm"
              variant={showGhostOverlay ? "secondary" : "outline"}
              onClick={() => setShowGhostOverlay(!showGhostOverlay)}
            >
              <Layers className="size-3.5 mr-1 text-cyan-400" />
              Reality Check
            </Button>
            <Button size="sm" variant="outline" onClick={seedDemoData}>
              <Sparkles className="size-3.5 mr-1 text-amber-400" />
              Seed Demo
            </Button>
          </div>
        }
      />

      {isLoading && <LoadingBlock rows={4} />}
      {isError && <ErrorState onRetry={() => refetch()} message="Could not load nodes." />}
      {!isLoading && !isError && (!nodes || nodes.length === 0) && (
        <EmptyState
          title="No nodes to visualize"
          description="Register a cluster and nodes first, from the Clusters / Nodes pages."
        />
      )}

      {nodes && nodes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <div className="relative flex flex-col space-y-4">
            {/* 3D WebGL Canvas Container */}
            <div className="glass-panel relative h-[620px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Room
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                riskByNodeId={riskByNodeId}
                migrationArc={migrationArc}
                timeOffset={timeOffset}
                scenarioMode={scenarioMode}
                showGhostOverlay={showGhostOverlay}
                isMigrationMode={isMigrationMode}
                safeCandidateScores={candidateScores}
                onSelectTargetNode={setSelectedTargetId}
                onUpdateScreenPoints={setNodeScreenPoints}
              />

              {/* Leader-Line HUD System (Screen Projected, Zero Collisions) */}
              {showGhostOverlay && (
                <HolographicHudOverlay
                  nodePoints={nodeScreenPoints}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  hoveredNodeId={hoveredNodeId}
                  onHoverNode={setHoveredNodeId}
                />
              )}

              {/* Floating Top Left: Twin Reality Check HUD */}
              <div className="absolute top-4 left-4 z-30">
                <TwinRealityOverlay
                  showGhostOverlay={showGhostOverlay}
                  onToggleGhostOverlay={setShowGhostOverlay}
                  twinGapData={twinGapData}
                />
              </div>

              {/* Floating Top Right: Safe Target Migration HUD */}
              {isMigrationMode && (
                <div className="absolute top-4 right-4 z-30">
                  <SafeTargetDragLayer
                    sourceNode={selectedNode}
                    candidates={candidateScores}
                    selectedTargetId={selectedTargetId}
                    onSelectTarget={setSelectedTargetId}
                    onCommitMigration={handleCommitMigration}
                    isMigrating={isMigrating}
                  />
                </div>
              )}
            </div>

            {/* Bottom Floating Temporal Time-Scrubbing Controls */}
            <TemporalSandboxControls
              timeOffset={timeOffset}
              onChangeTimeOffset={setTimeOffset}
              scenarioMode={scenarioMode}
              onToggleScenario={setScenarioMode}
            />
          </div>

          {/* Right Sidebar: Node Inspection & Recovery HUD */}
          <div className="space-y-4">
            <NodeInspector node={selectedNode} />
            <RealityPanel node={selectedNode} />
            <RecoveryPanel node={selectedNode} />
          </div>
        </div>
      )}
    </div>
  );
}
