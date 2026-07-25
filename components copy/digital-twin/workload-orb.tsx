"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";

export function WorkloadOrb({
  position,
  active,
  onClick,
  label = "Workload Container #8912",
}: {
  position: [number, number, number];
  active: boolean;
  onClick: () => void;
  label?: string;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.02;
    meshRef.current.rotation.x += 0.01;
    const floatOffset = Math.sin(state.clock.elapsedTime * 2) * 0.08;
    meshRef.current.position.y = position[1] + 0.45 + floatOffset;
  });

  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color={active ? "#38bdf8" : "#f43f5e"}
          emissive={active ? "#0284c7" : "#e11d48"}
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.8}
          wireframe
        />
      </mesh>

      <Html distanceFactor={8} position={[0, 0.8, 0]} center>
        <button
          onClick={onClick}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all shadow-xl backdrop-blur-md ${
            active
              ? "border-sky-400/60 bg-sky-950/80 text-sky-300 ring-2 ring-sky-400/40"
              : "border-rose-500/60 bg-rose-950/80 text-rose-300 animate-pulse"
          }`}
        >
          <span className="size-2 rounded-full bg-current" />
          <span>{label}</span>
        </button>
      </Html>
    </group>
  );
}
