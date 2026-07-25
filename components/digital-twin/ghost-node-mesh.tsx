"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

import type { ClusterNode } from "@/types";

export function GhostNodeMesh({
  node,
  position,
  predictedTemp,
  predictedCpu,
  riskScore,
}: {
  node: ClusterNode;
  position: [number, number, number];
  predictedTemp: number;
  predictedCpu: number;
  riskScore: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const ghostPosition: [number, number, number] = [
    position[0] + 0.05,
    position[1] + 0.03,
    position[2] + 0.05,
  ];

  const color = riskScore >= 75 ? "#f43f5e" : "#38bdf8";

  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
    (meshRef.current.material as { opacity?: number }).opacity = pulse;
  });

  return (
    <group position={ghostPosition}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.85, 0.25, 0.53]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}
