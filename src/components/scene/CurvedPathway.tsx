'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS, getNoiseTexture } from './SharedContext';

// Export the path curve so the student can follow it
// Creating a very clean, compact L-shaped pathway for the final maquette
export const pathCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-6, 0, 6),    // Entry / Classroom
  new THREE.Vector3(-2, 0, 6),    // Corridor (Crowding)
  new THREE.Vector3(2, 0, 5),     // Curve Start (Unexpected Change)
  new THREE.Vector3(4, 0, 2),     // Curve Middle
  new THREE.Vector3(4, 0, -1),    // Transition stairs approach
  new THREE.Vector3(4, 0, -4),    // Transition stairs up (FLATTENED)
  new THREE.Vector3(4, 0, -7),    // Plaza (Noise) (FLATTENED)
  new THREE.Vector3(4, 0, -10)    // Destination Arch (FLATTENED)
], false, 'catmullrom', 0.2);

export function CurvedPathway() {
  // Extrude a recessed, thick terracotta walkway
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = 1.0; // Wide architectural path
    const depth = 0.4; // Thickness of the path slab
    shape.moveTo(-width, -depth);
    shape.lineTo(width, -depth);
    shape.lineTo(width, 0);
    shape.lineTo(-width, 0);
    shape.lineTo(-width, -depth);

    return new THREE.ExtrudeGeometry(shape, {
      steps: 100,
      extrudePath: pathCurve,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
  }, []);

  return (
    <group position={[0, -0.05, 0]}>
      {/* The main terracotta path */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial 
          color={COLORS.pathway} 
          roughness={0.95} 
          metalness={0.05}
          bumpMap={getNoiseTexture()} 
          bumpScale={0.005} 
        />
      </mesh>
    </group>
  );
}
