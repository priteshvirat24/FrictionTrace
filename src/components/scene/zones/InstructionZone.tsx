'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, getNoiseTexture } from '../SharedContext';

export function InstructionZone({ isJudgeMode, environmentState }: { isJudgeMode: boolean, environmentState?: string }) {
  const signRef = useRef<THREE.Group>(null);
  const pointerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!signRef.current || !pointerRef.current) return;

    let targetRotation = 0;
    let targetColor = new THREE.Color(COLORS.secondary);

    if (isJudgeMode && (environmentState === 'monday' || environmentState === 'pattern')) {
      // MONDAY: Instruction - Sign direction changes (rotates)
      targetRotation = Math.PI / 2; 
      targetColor.set(COLORS.accent);
    }

    pointerRef.current.rotation.y = THREE.MathUtils.lerp(pointerRef.current.rotation.y, targetRotation, 0.05);
    
    const mat = pointerRef.current.material as THREE.MeshStandardMaterial;
    mat.color.lerp(targetColor, 0.05);
  });

  // Placed at Monday (x=-6, z=6) near Classroom
  return (
    <group position={[-6, 0, 7.5]} ref={signRef}>
      {/* Sign Post */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.2]} />
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} />
      </mesh>
      
      {/* Sign Pointer */}
      <RoundedBox 
        ref={pointerRef}
        args={[0.8, 0.3, 0.05]} 
        position={[0, 1.0, 0]} 
        radius={0.02} 
        smoothness={4} 
        castShadow
      >
        <meshStandardMaterial color={COLORS.secondary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>
    </group>
  );
}
