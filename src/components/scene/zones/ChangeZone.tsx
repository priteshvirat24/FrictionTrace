'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, getNoiseTexture } from '../SharedContext';

export function ChangeZone({ isJudgeMode, environmentState }: { isJudgeMode: boolean, environmentState?: string }) {
  const doorRef = useRef<THREE.Mesh>(null);
  const wallRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!doorRef.current || !wallRef.current) return;

    // Normal state: Door is retracted (hidden inside wall)
    let targetZ = 4.0;
    let targetColor = new THREE.Color(COLORS.secondary);

    if (isJudgeMode && (environmentState === 'wednesday' || environmentState === 'pattern')) {
      // WEDNESDAY: Unexpected Change - Partition slides across the path
      targetZ = 5.2; // Slides out to block the path
      targetColor.set(COLORS.accent);
    }

    doorRef.current.position.z = THREE.MathUtils.lerp(doorRef.current.position.z, targetZ, 0.05);
    
    const mat = doorRef.current.material as THREE.MeshStandardMaterial;
    mat.color.lerp(targetColor, 0.05);
  });

  // Placed at Wednesday (x=2, z=5)
  return (
    <group position={[2, 0, 5]}>
      {/* Sliding Partition */}
      <RoundedBox 
        ref={doorRef}
        args={[1.8, 1, 0.2]} 
        position={[0, 0.5, 4.0]} // Initially hidden
        rotation={[0, Math.PI / 4, 0]} // Angled to match the curve
        radius={0.02} 
        smoothness={4} 
        receiveShadow castShadow
      >
        <meshStandardMaterial color={COLORS.secondary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>

      {/* Wall housing the partition */}
      <RoundedBox 
        ref={wallRef}
        args={[2, 1.2, 0.6]} 
        position={[0.5, 0.6, 3.5]} 
        rotation={[0, Math.PI / 4, 0]}
        radius={0.05} 
        smoothness={4} 
        receiveShadow castShadow
      >
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>
    </group>
  );
}
