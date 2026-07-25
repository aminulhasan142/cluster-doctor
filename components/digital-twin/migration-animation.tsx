"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import { Vector3, type Mesh } from "three";

export function MigrationAnimation({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  const markerRef = useRef<Mesh>(null);

  const start = new Vector3(...from);
  const end = new Vector3(...to);
  const mid = start.clone().lerp(end, 0.5).add(new Vector3(0, 1.4, 0));

  useFrame((state) => {
    if (!markerRef.current) return;
    const t = (Math.sin(state.clock.elapsedTime * 1.2) + 1) / 2;
    const p1 = start.clone().lerp(mid, t);
    const p2 = mid.clone().lerp(end, t);
    const point = p1.lerp(p2, t);
    markerRef.current.position.copy(point);
  });

  return (
    <group>
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color="var(--ai)"
        lineWidth={1.5}
        dashed
        dashScale={12}
      />
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#9085e9" emissive="#9085e9" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}
