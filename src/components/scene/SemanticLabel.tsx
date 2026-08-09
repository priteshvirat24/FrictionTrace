'use client';

import { Html } from '@react-three/drei';
import React from 'react';

interface Props {
  position: [number, number, number];
  icon: React.ReactNode;
  label: string;
  opacity?: number;
}

export function SemanticLabel({ position, icon, label, opacity = 1 }: Props) {
  return (
    <group position={position}>
      {/* Very thin connector line going down to the architecture */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 1.2]} />
        <meshBasicMaterial color="#C08C72" transparent opacity={opacity * 0.8} />
      </mesh>
      
      {/* The floating miniature pill label */}
      <Html center position={[0, 0, 0]} style={{ transition: 'opacity 0.4s', opacity }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: '9999px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
          transform: 'scale(1)',
          transition: 'transform 0.2s',
          cursor: 'default'
        }}>
          <div className="text-[#985D48] flex items-center justify-center">
            {icon}
          </div>
          <span className="text-[9px] font-semibold tracking-wider text-[#985D48] uppercase">
            {label}
          </span>
        </div>
      </Html>
    </group>
  );
}
