'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../SharedContext';

export function NoiseZone({ isJudgeMode, environmentState }: { isJudgeMode: boolean, environmentState?: string }) {
  const wavesRef = useRef<THREE.Group>(null);
  
  // Create subtle concentric rings
  const rings = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => (i + 1) * 0.8);
  }, []);

  useFrame((state) => {
    if (!wavesRef.current) return;

    let targetIntensity = 0;
    
    if (isJudgeMode && (environmentState === 'tuesday' || environmentState === 'pattern')) {
      // TUESDAY: Noise - Waves gently expand and contract
      targetIntensity = 1;
    }

    const time = state.clock.getElapsedTime();
    
    wavesRef.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      
      // Interpolate opacity based on state
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetIntensity * 0.4, 0.05);
      
      if (mat.opacity > 0.01) {
        // Animate scale outward if active
        const scaleOffset = (time * 0.5 + index * 0.25) % 1;
        const scale = 1 + scaleOffset * 0.5;
        mesh.scale.set(scale, scale, scale);
        
        // Fade out as they get larger
        mat.opacity = (targetIntensity * 0.4) * (1 - scaleOffset);
      }
    });
  });

  // Placed at Tuesday (x=4, z=-7) in the Plaza
  return (
    <group position={[4, 0.01, -7]} ref={wavesRef}>
      {rings.map((radius, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.05, 32]} />
          <meshStandardMaterial color={COLORS.accent} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
