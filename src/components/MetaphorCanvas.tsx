'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrbitControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ArchitecturalEnvironment } from './scene/ArchitecturalEnvironment';

interface Props {
  frictionCount?: number;
  judgeModeStep?: number;
  isJudgeMode?: boolean;
  environmentState?: string;
}

function ParallaxGroup({ children, isJudgeMode }: { children: React.ReactNode, isJudgeMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current || isJudgeMode) return;
    
    // Calculate target rotation based on pointer
    const targetX = (state.pointer.y * Math.PI) / 60; // Max tilt up/down (very subtle)
    const targetY = (state.pointer.x * Math.PI) / 60; // Max tilt left/right (very subtle)
    
    // Smoothly interpolate current rotation to target rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetY, 0.05); 
  });

  return <group ref={groupRef}>{children}</group>;
}

function CameraRig({ isJudgeMode, environmentState }: { isJudgeMode: boolean, environmentState: string }) {
  useFrame((state) => {
    // Default tight isometric view framing the compact layout perfectly
    let targetX = 18;
    let targetY = 20;
    let targetZ = 18;
    let lookX = 0;
    let lookY = 0;
    let lookZ = 0;

    if (isJudgeMode) {
      if (environmentState === 'monday') {
        // Focus on Entry / Classroom
        targetX = -12; targetY = 6; targetZ = 12;
        lookX = -6; lookY = 0; lookZ = 6;
      } else if (environmentState === 'tuesday') {
        // Focus on Plaza (Noise)
        targetX = 10; targetY = 6; targetZ = -2;
        lookX = 4; lookY = 0; lookZ = -6;
      } else if (environmentState === 'wednesday') {
        // Focus on Change (Door)
        targetX = 8; targetY = 8; targetZ = 8;
        lookX = 2; lookY = 0; lookZ = 5;
      } else if (environmentState === 'thursday') {
        // Focus on Crowding Corridor
        targetX = -2; targetY = 8; targetZ = 12;
        lookX = -2; lookY = 0; lookZ = 6;
      } else if (environmentState === 'pattern') {
        // Pull back to see the whole week (Aha Moment)
        targetX = 18; targetY = 22; targetZ = 18;
        lookX = 0; lookY = 0; lookZ = 0;
      } else if (environmentState === 'understanding') {
        // Drop down low near the student and look towards the destination arch
        targetX = -2; targetY = 3; targetZ = -2;
        lookX = 4; lookY = 0; lookZ = -10;
      }
    }

    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.02);
    
    // Smoothly interpolate lookAt
    const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    const targetLookAt = new THREE.Vector3(lookX, lookY, lookZ).sub(state.camera.position).normalize();
    currentLookAt.lerp(targetLookAt, 0.04);
    
    const targetLookPos = state.camera.position.clone().add(currentLookAt);
    state.camera.lookAt(targetLookPos);
  });
  return null;
}

export default function MetaphorCanvas({ 
  frictionCount = 0, 
  judgeModeStep = 0,
  isJudgeMode = false,
  environmentState = 'normal'
}: Props) {
  
  const [shouldRender3D, setShouldRender3D] = useState(true);

  useEffect(() => {
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (prefersReducedMotion || !gl) {
        setShouldRender3D(false);
      }
    } catch (e) {
      setShouldRender3D(false);
    }
  }, []);

  if (!shouldRender3D) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(192, 140, 114, 0.1) 0%, transparent 70%)' }} />
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* Tighter default camera for the small layout */}
      <Canvas shadows camera={{ position: [18, 20, 18], fov: 42 }} dpr={[1, 2]}>
        {/* Soft, clean, bright lighting without harsh shadows */}
        <ambientLight intensity={0.9} color="#FAF0E8" />
        <hemisphereLight args={['#FFFFFF', '#DDBB99', 0.6]} />
        
        <directionalLight 
          position={[15, 25, 10]} 
          intensity={1.0} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-bias={-0.0001}
          color="#FFF7F0"
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.7} color="#DDBB99" />
        <directionalLight position={[0, -5, 10]} intensity={0.5} color="#C08C72" />
        
        {/* PBR Environment Lighting for material reflections */}
        <Environment preset="city" environmentIntensity={0.6} />
        
        <CameraRig isJudgeMode={isJudgeMode} environmentState={environmentState} />
        
        {!isJudgeMode && (
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={15}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minPolarAngle={0.1}
            autoRotate={false}
            dampingFactor={0.05}
          />
        )}
        
        <Float speed={1.0} rotationIntensity={0.015} floatIntensity={0.02}>
          <group rotation={[0, Math.PI / 4, 0]}>
            <ParallaxGroup isJudgeMode={isJudgeMode}>
              <ArchitecturalEnvironment 
                scrollProgress={frictionCount} 
                judgeModeStep={judgeModeStep} 
                isJudgeMode={isJudgeMode}
                environmentState={environmentState}
              />
            </ParallaxGroup>
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
