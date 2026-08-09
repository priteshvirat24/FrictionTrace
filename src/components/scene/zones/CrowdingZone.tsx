'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, getNoiseTexture } from '../SharedContext';

export function CrowdingZone({ isJudgeMode, environmentState }: { isJudgeMode: boolean, environmentState?: string }) {
  const leftBlockRef = useRef<THREE.Mesh>(null);
  const rightBlockRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!leftBlockRef.current || !rightBlockRef.current) return;

    // Normal state: Blocks form a normal corridor
    // The path is at x=4, z=2. Path width is 2.0 (from x=3 to x=5).
    let targetLeftX = 2.5; // Outer edge
    let targetRightX = 5.5; // Inner edge
    let targetColor = new THREE.Color(COLORS.primary);

    if (isJudgeMode && (environmentState === 'thursday' || environmentState === 'pattern')) {
      // THURSDAY: Crowding - The architectural blocks physically squeeze the path
      targetLeftX = 3.2; // Squeeze in
      targetRightX = 4.8; // Squeeze in
      targetColor.set(COLORS.accent);
    }

    leftBlockRef.current.position.x = THREE.MathUtils.lerp(leftBlockRef.current.position.x, targetLeftX, 0.04);
    rightBlockRef.current.position.x = THREE.MathUtils.lerp(rightBlockRef.current.position.x, targetRightX, 0.04);
    
    const matL = leftBlockRef.current.material as THREE.MeshStandardMaterial;
    matL.color.lerp(targetColor, 0.04);
    const matR = rightBlockRef.current.material as THREE.MeshStandardMaterial;
    matR.color.lerp(targetColor, 0.04);
  });

  // Placed at Thursday (x=4, z=2)
  return (
    <group position={[0, 0, 2]}>
      {/* Left Squeezing Block */}
      <RoundedBox 
        ref={leftBlockRef}
        args={[1.5, 1, 2]} 
        position={[2.5, 0.5, 0]} 
        radius={0.05} 
        smoothness={4} 
        receiveShadow castShadow
      >
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>

      {/* Right Squeezing Block */}
      <RoundedBox 
        ref={rightBlockRef}
        args={[1.5, 1, 2]} 
        position={[5.5, 0.5, 0]} 
        radius={0.05} 
        smoothness={4} 
        receiveShadow castShadow
      >
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>
    </group>
  );
}
