'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, getNoiseTexture } from './SharedContext';
import { pathCurve } from './CurvedPathway';

export function StudentFigure({ 
  isJudgeMode, 
  judgeModeStep, 
  scrollProgress = 0,
  environmentState = 'normal'
}: { 
  isJudgeMode: boolean, 
  judgeModeStep: number, 
  scrollProgress?: number,
  environmentState?: string
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  
  // Track our current target T along the path (0 to 1)
  const currentT = useRef(0.01);

  useFrame((state) => {
    if (!groupRef.current || !bodyGroupRef.current) return;
    
    let targetT = 0.01; // Default resting position
    
    if (isJudgeMode) {
      // Synchronize strictly with the state machine narrative
      if (environmentState === 'monday') targetT = 0.15;
      else if (environmentState === 'tuesday') targetT = 0.4;
      else if (environmentState === 'wednesday') targetT = 0.6;
      else if (environmentState === 'thursday') targetT = 0.75;
      else if (environmentState === 'pattern') targetT = 0.75;
      else if (environmentState === 'understanding') targetT = 0.99;
      else targetT = 0.01;
    } else {
      // Normal mode: Map scroll progress to subtle movement
      targetT = 0.01 + (scrollProgress * 0.1);
    }
    
    const previousT = currentT.current;
    
    // Smoothly interpolate T
    currentT.current = THREE.MathUtils.lerp(currentT.current, targetT, 0.015);
    
    // Calculate movement speed for walking animation
    const speed = Math.abs(currentT.current - previousT);
    const isMoving = speed > 0.0001;
    
    // Get position on curve
    const position = pathCurve.getPointAt(currentT.current);
    
    // Get tangent to look forward along the curve
    const tangent = pathCurve.getTangentAt(currentT.current);
    const lookAtPos = position.clone().add(tangent);
    
    // Calculate manual elevation offset since the path curve is now flat
    let yOffset = 0;
    if (position.z <= -1.5 && position.z >= -3.5) {
      yOffset = THREE.MathUtils.mapLinear(position.z, -1.5, -3.5, 0, 0.4);
    } else if (position.z < -3.5) {
      yOffset = 0.4;
    }
    
    // Update base position and rotation
    groupRef.current.position.set(position.x, position.y + 0.45 + yOffset, position.z);
    groupRef.current.lookAt(lookAtPos);

    const time = state.clock.getElapsedTime();

    // Idle animation (subtle breathing/bobbing)
    if (!isMoving) {
      bodyGroupRef.current.position.y = Math.sin(time * 2) * 0.015;
      
      // Rest limbs
      if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
      }
    } else {
      // Walking animation
      bodyGroupRef.current.position.y = Math.abs(Math.sin(time * 10)) * 0.03;
      
      if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
        const walkCycle = time * 8; // Animation speed
        
        leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.3;
        rightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
        
        leftArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
        rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.3;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Group for idle bobbing */}
      <group ref={bodyGroupRef}>
        {/* Head */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={COLORS.person} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
        </mesh>
        
        {/* Torso */}
        <RoundedBox args={[0.2, 0.4, 0.12]} position={[0, 0.3, 0]} radius={0.04} smoothness={4} castShadow>
          <meshStandardMaterial color={COLORS.person} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
        </RoundedBox>

        {/* Left Arm */}
        <group position={[-0.15, 0.45, 0]}>
          <RoundedBox ref={leftArmRef} args={[0.06, 0.3, 0.06]} position={[0, -0.15, 0]} radius={0.03} smoothness={4} castShadow>
            <meshStandardMaterial color={COLORS.person} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
          </RoundedBox>
        </group>

        {/* Right Arm */}
        <group position={[0.15, 0.45, 0]}>
          <RoundedBox ref={rightArmRef} args={[0.06, 0.3, 0.06]} position={[0, -0.15, 0]} radius={0.03} smoothness={4} castShadow>
            <meshStandardMaterial color={COLORS.person} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
          </RoundedBox>
        </group>

        {/* Left Leg */}
        <group position={[-0.06, 0.05, 0]}>
          <RoundedBox ref={leftLegRef} args={[0.08, 0.35, 0.08]} position={[0, -0.15, 0]} radius={0.03} smoothness={4} castShadow>
            <meshStandardMaterial color={COLORS.person} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
          </RoundedBox>
        </group>

        {/* Right Leg */}
        <group position={[0.06, 0.05, 0]}>
          <RoundedBox ref={rightLegRef} args={[0.08, 0.35, 0.08]} position={[0, -0.15, 0]} radius={0.03} smoothness={4} castShadow>
            <meshStandardMaterial color={COLORS.person} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
          </RoundedBox>
        </group>
      </group>
    </group>
  );
}
