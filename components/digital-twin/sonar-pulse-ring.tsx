"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Group } from "three";

export function SonarPulseRing({
  position,
  color = "#f43f5e",
}: {
  position: [number, number, number];
  color?: string;
}) {
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 1.5;

    if (ring1Ref.current) {
      const s1 = 1 + ((t % 2) / 2) * 1.8;
      const op1 = Math.max(0, 1 - (t % 2) / 2);
      ring1Ref.current.scale.set(s1, s1, 1);
      (ring1Ref.current.material as { opacity?: number }).opacity = op1 * 0.7;
    }

    if (ring2Ref.current) {
      const t2 = (t + 1) % 2;
      const s2 = 1 + (t2 / 2) * 1.8;
      const op2 = Math.max(0, 1 - t2 / 2);
      ring2Ref.current.scale.set(s2, s2, 1);
      (ring2Ref.current.material as { opacity?: number }).opacity = op2 * 0.7;
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] - 0.12, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ring1Ref}>
        <ringGeometry args={[0.45, 0.52, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.45, 0.52, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}
