"use client";

import { useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

import { Rack } from "@/components/digital-twin/rack";
import { MigrationAnimation } from "@/components/digital-twin/migration-animation";
import { GhostNodeMesh } from "@/components/digital-twin/ghost-node-mesh";
import { SonarPulseRing } from "@/components/digital-twin/sonar-pulse-ring";
import { WorkloadOrb } from "@/components/digital-twin/workload-orb";
import { CandidateTargetScore } from "@/components/digital-twin/safe-target-drag-layer";
import type { NodeScreenPoint } from "@/components/digital-twin/holographic-hud-overlay";
import type { ClusterNode } from "@/types";

const NODES_PER_RACK = 6;
const RACK_SPACING = 1.6;

interface RackLayout {
  key: string;
  label: string;
  position: [number, number, number];
  nodes: ClusterNode[];
}

function buildLayout(nodesByCluster: Map<number, ClusterNode[]>): RackLayout[] {
  const racks: RackLayout[] = [];
  let rackIndex = 0;

  for (const [clusterId, nodes] of nodesByCluster) {
    const chunkCount = Math.max(1, Math.ceil(nodes.length / NODES_PER_RACK));

    for (let c = 0; c < chunkCount; c++) {
      const chunk = nodes.slice(c * NODES_PER_RACK, (c + 1) * NODES_PER_RACK);
      racks.push({
        key: `${clusterId}-${c}`,
        label: `Cluster ${clusterId} · Rack ${c + 1}`,
        position: [rackIndex * RACK_SPACING - 0, 0, 0],
        nodes: chunk,
      });
      rackIndex++;
    }
  }

  const totalWidth = (racks.length - 1) * RACK_SPACING;
  return racks.map((r, i) => ({
    ...r,
    position: [i * RACK_SPACING - totalWidth / 2, 0, 0],
  }));
}

function CameraProjector({
  nodes,
  layout,
  onUpdateScreenPoints,
}: {
  nodes: ClusterNode[];
  layout: RackLayout[];
  onUpdateScreenPoints: (points: NodeScreenPoint[]) => void;
}) {
  const { camera, size } = useThree();
  const vec = useRef(new Vector3());
  const lastPointsRef = useRef<NodeScreenPoint[]>([]);

  useFrame(() => {
    const points: NodeScreenPoint[] = [];
    let moved = false;

    for (const rack of layout) {
      for (let idx = 0; idx < rack.nodes.length; idx++) {
        const node = rack.nodes[idx];
        const worldPos: [number, number, number] = [
          rack.position[0],
          0.25 + idx * 0.3,
          rack.position[2],
        ];

        vec.current.set(worldPos[0], worldPos[1], worldPos[2]);
        vec.current.project(camera);

        const x = ((vec.current.x + 1) * size.width) / 2;
        const y = ((-vec.current.y + 1) * size.height) / 2;
        const isBehind = vec.current.z > 1;

        const newPos = isBehind ? null : { x, y };
        const lastPoint = lastPointsRef.current.find((p) => p.node.id === node.id);

        if (!lastPoint || !lastPoint.screenPos || !newPos) {
          if ((lastPoint?.screenPos === null) !== (newPos === null)) moved = true;
        } else {
          const dx = Math.abs(lastPoint.screenPos.x - x);
          const dy = Math.abs(lastPoint.screenPos.y - y);
          if (dx > 1.5 || dy > 1.5) moved = true;
        }

        points.push({
          node,
          screenPos: newPos,
          riskScore: node.id === 102 ? 96 : node.temperature > 80 ? 80 : 15,
          predictedTemp: node.id === 102 ? 94.2 : node.temperature + 2,
          predictedCpu: node.id === 102 ? 98 : node.cpu_usage + 5,
        });
      }
    }

    if (moved || lastPointsRef.current.length !== points.length) {
      lastPointsRef.current = points;
      onUpdateScreenPoints(points);
    }
  });

  return null;
}

export function Room({
  nodes,
  selectedNodeId,
  onSelectNode,
  riskByNodeId,
  migrationArc,
  timeOffset = 0,
  scenarioMode = "default",
  showGhostOverlay = false,
  isMigrationMode = false,
  safeCandidateScores = [],
  onSelectTargetNode,
  onUpdateScreenPoints,
}: {
  nodes: ClusterNode[];
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number) => void;
  riskByNodeId: Record<number, number>;
  migrationArc?: { sourceNodeId: number; targetNodeId: number } | null;
  timeOffset?: number;
  scenarioMode?: "default" | "healed";
  showGhostOverlay?: boolean;
  isMigrationMode?: boolean;
  safeCandidateScores?: CandidateTargetScore[];
  onSelectTargetNode?: (targetId: number) => void;
  onUpdateScreenPoints?: (points: NodeScreenPoint[]) => void;
}) {
  const layout = useMemo(() => {
    const byCluster = new Map<number, ClusterNode[]>();
    for (const rawNode of nodes) {
      const node = { ...rawNode };
      if (node.id === 102 && timeOffset > 0) {
        if (scenarioMode === "default") {
          node.temperature = Math.min(102, node.temperature + timeOffset * 0.9);
          node.cpu_usage = Math.min(99, node.cpu_usage + timeOffset * 0.6);
        } else {
          node.temperature = Math.max(45, 88.2 - timeOffset * 3);
          node.cpu_usage = Math.max(25, 89.4 - timeOffset * 4);
          node.status = "ONLINE";
        }
      }

      const list = byCluster.get(node.cluster_id) ?? [];
      list.push(node);
      byCluster.set(node.cluster_id, list);
    }
    return buildLayout(byCluster);
  }, [nodes, timeOffset, scenarioMode]);

  const nodePosition = (nodeId: number): [number, number, number] | null => {
    for (const rack of layout) {
      const idx = rack.nodes.findIndex((n) => n.id === nodeId);
      if (idx !== -1) {
        return [rack.position[0], 0.25 + idx * 0.3, rack.position[2]];
      }
    }
    return null;
  };

  const failingNode = nodes.find((n) => n.id === 102 || n.status === "FAILED") ?? nodes[0];
  const failingPos = failingNode ? nodePosition(failingNode.id) : null;

  const arcPoints =
    migrationArc &&
    nodePosition(migrationArc.sourceNodeId) &&
    nodePosition(migrationArc.targetNodeId)
      ? {
          from: nodePosition(migrationArc.sourceNodeId)!,
          to: nodePosition(migrationArc.targetNodeId)!,
        }
      : null;

  return (
    <Canvas camera={{ position: [4, 3.2, 6], fov: 42 }} shadows dpr={[1, 1.5]}>
      <color attach="background" args={["#060709"]} />
      <fog attach="fog" args={["#060709", 8, 22]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 4]} intensity={1.1} castShadow />
      <pointLight position={[-4, 3, -3]} intensity={0.5} color="#38bdf8" />
      <pointLight position={[4, 3, 3]} intensity={0.45} color="#818cf8" />

      {onUpdateScreenPoints && (
        <CameraProjector
          nodes={nodes}
          layout={layout}
          onUpdateScreenPoints={onUpdateScreenPoints}
        />
      )}

      <Grid
        position={[0, -0.02, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#171a22"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#262a33"
        fadeDistance={18}
        infiniteGrid
      />

      {layout.map((rack) => (
        <Rack
          key={rack.key}
          label={rack.label}
          position={rack.position}
          nodes={rack.nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          riskByNodeId={riskByNodeId}
        />
      ))}

      {/* Sonar Radar Pulse Rings on Critical Nodes */}
      {nodes.map((node) => {
        const risk = riskByNodeId[node.id] ?? (node.id === 102 ? 96 : 0);
        if (risk < 75) return null;
        const pos = nodePosition(node.id);
        if (!pos) return null;
        return <SonarPulseRing key={`sonar-${node.id}`} position={pos} color="#f43f5e" />;
      })}

      {/* Holographic Ghost Overlay (Prediction vs Actual) */}
      {showGhostOverlay &&
        nodes.map((node) => {
          const pos = nodePosition(node.id);
          if (!pos) return null;
          const predTemp = node.id === 102 ? 94.2 : node.temperature + 2;
          const predCpu = node.id === 102 ? 98 : node.cpu_usage + 5;
          const risk = node.id === 102 ? 96 : 15;
          return (
            <GhostNodeMesh
              key={`ghost-${node.id}`}
              node={node}
              position={pos}
              predictedTemp={predTemp}
              predictedCpu={predCpu}
              riskScore={risk}
            />
          );
        })}

      {/* Interactive 3D Workload Energy Orb */}
      {failingPos && (
        <WorkloadOrb
          position={failingPos}
          active={isMigrationMode}
          onClick={() => onSelectNode(failingNode.id)}
          label={failingNode.hostname}
        />
      )}

      {arcPoints && <MigrationAnimation from={arcPoints.from} to={arcPoints.to} />}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={!isMigrationMode}
        autoRotateSpeed={0.4}
      />
    </Canvas>
  );
}
