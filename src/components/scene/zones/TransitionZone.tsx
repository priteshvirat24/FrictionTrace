'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, getNoiseTexture } from '../SharedContext';

export function TransitionZone({ isJudgeMode, environmentState }: { isJudgeMode: boolean, environmentState?: string }) {
  const stepsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!stepsRef.current) return;

    let targetColor = new THREE.Color(COLORS.pathway);
    let targetZOffset = 0;

    if (isJudgeMode && environmentState === 'pattern') {
      targetColor.set(COLORS.accent);
      targetZOffset = 0.05; 
    }

    stepsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.lerp(targetColor, 0.05);
      
      mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, (i * -0.5) + targetZOffset, 0.05);
    });
  });

  // Steps start at z=-1.5 and go to z=-3.0 (4 steps of 0.5 depth)
  // Height rises from 0.1 to 0.4 (4 steps of 0.1 height)
  return (
    <group position={[4, 0, -1.5]} ref={stepsRef}>
      {[0, 1, 2, 3].map((i) => (
        <RoundedBox 
          key={i}
          args={[2.0, 0.1, 0.5]} 
          position={[0, i * 0.1 + 0.05, i * -0.5]} 
          radius={0.02} 
          smoothness={4} 
          receiveShadow castShadow
        >
          <meshStandardMaterial color={COLORS.pathway} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
        </RoundedBox>
      ))}
    </group>
  );
}
