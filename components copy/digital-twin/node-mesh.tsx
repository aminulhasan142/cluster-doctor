"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

import type { ClusterNode } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  ONLINE: "#10b981",
  OFFLINE: "#64748b",
  MAINTENANCE: "#f59e0b",
  FAILED: "#f43f5e",
};

export function NodeMesh({
  node,
  position,
  selected,
  onSelect,
  riskScore,
}: {
  node: ClusterNode;
  position: [number, number, number];
  selected: boolean;
  onSelect: (nodeId: number) => void;
  riskScore?: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const isCritical = riskScore !== undefined && riskScore >= 75 && node.status === "ONLINE";
  const color = isCritical ? "#f43f5e" : STATUS_COLOR[node.status] ?? "#64748b";

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetScale = hovered || selected ? 1.12 : 1;
    meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale } as never, 0.15);

    if (isCritical) {
      const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
      (meshRef.current.material as { emissiveIntensity?: number }).emissiveIntensity = pulse;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.82, 0.22, 0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.95 : 0.35}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}
