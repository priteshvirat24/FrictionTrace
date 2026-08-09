'use client';

import { CurvedPathway } from './CurvedPathway';
import { StudentFigure } from './StudentFigure';
import { CrowdingZone } from './zones/CrowdingZone';
import { ChangeZone } from './zones/ChangeZone';
import { TransitionZone } from './zones/TransitionZone';
import { NoiseZone } from './zones/NoiseZone';
import { InstructionZone } from './zones/InstructionZone';
import { SemanticLabel } from './SemanticLabel';
import { Users, Shuffle, Volume2, Info, ArrowRightLeft } from 'lucide-react';
import { RoundedBox } from '@react-three/drei';
import { COLORS, getNoiseTexture, getDottedTexture } from './SharedContext';

export function ArchitecturalEnvironment({ 
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
  
  return (
    <group position={[0, -0.5, 0]}>
      {/* --- DOTTED GROUND PLANE --- */}
      <mesh position={[0, -1.0, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial color="#88624E" opacity={0.1} />
      </mesh>

      {/* --- SOLID MAQUETTE BASE PLINTH --- */}
      {/* This grounds the entire model in a single unified foundation */}
      <RoundedBox args={[14.2, 0.4, 22.2]} position={[0, -0.2, -2]} radius={0.05} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>
      
      {/* --- UPPER ARCHITECTURAL BLOCKS --- */}
      {/* These blocks sit perfectly on the plinth and frame the recessed path, leaving exactly enough room for it */}
      
      {/* 1. Inner Left Wall (Classroom / Corridor inside edge) */}
      <RoundedBox args={[7, 1.2, 5]} position={[-3, 0.6, 2.5]} radius={0.05} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>

      {/* 2. Inner Left Wall (Transition / Plaza inside edge) */}
      <RoundedBox args={[4, 1.0, 8]} position={[1, 0.5, -6]} radius={0.05} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>

      {/* 3. Outer Right Wall (Entry outside edge) - Thinner border */}
      <RoundedBox args={[7, 0.8, 1.5]} position={[-3.5, 0.4, 8.25]} radius={0.05} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>

      {/* 4. Outer Right Wall (Main outer curved boundary) - Thinner border */}
      <RoundedBox args={[2, 1.4, 16]} position={[6.0, 0.7, -1]} radius={0.05} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>

      {/* 5. Destination Arch Block (Thick end-wall) - Matched to thinner border */}
      <RoundedBox args={[10, 2.0, 2]} position={[2, 1.0, -12]} radius={0.05} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} bumpMap={getNoiseTexture()} bumpScale={0.01} />
      </RoundedBox>

      {/* 6. Raised Plaza Platform (Destination) */}
      <RoundedBox args={[2, 0.4, 8.5]} position={[4, 0.15, -7.75]} radius={0.02} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color={COLORS.pathway} roughness={0.95} bumpMap={getNoiseTexture()} bumpScale={0.005} />
      </RoundedBox>
      
      {/* Cutout for the Archway (Visual representation) */}
      <mesh position={[4, 1.0, -11.9]} receiveShadow castShadow>
        <boxGeometry args={[2.2, 2.1, 2.2]} />
        <meshStandardMaterial color={COLORS.primary} roughness={0.9} />
      </mesh>

      {/* --- FRICTION ZONES --- */}
      {/* We pass the environmentState to drive the animations directly */}
      <CrowdingZone isJudgeMode={isJudgeMode} environmentState={environmentState} />
      <ChangeZone isJudgeMode={isJudgeMode} environmentState={environmentState} />
      <TransitionZone isJudgeMode={isJudgeMode} environmentState={environmentState} />
      <NoiseZone isJudgeMode={isJudgeMode} environmentState={environmentState} />
      <InstructionZone isJudgeMode={isJudgeMode} environmentState={environmentState} />
      
      {/* --- SEMANTIC LABELS --- */}
      {environmentState !== 'understanding' && (
        <group>
          {/* We use opacities driven by environmentState to show/hide labels cleanly */}
          <SemanticLabel 
            position={[-2.5, 2.5, 6]} 
            icon={<Users size={12} />} 
            label="Crowding" 
            opacity={(environmentState === 'normal' || environmentState === 'thursday' || environmentState === 'pattern') ? 1 : 0.2}
          />
          <SemanticLabel 
            position={[2, 2.5, 2]} 
            icon={<Shuffle size={12} />} 
            label="Unexpected Change" 
            opacity={(environmentState === 'normal' || environmentState === 'wednesday' || environmentState === 'pattern') ? 1 : 0.2}
          />
          <SemanticLabel 
            position={[6, 3.5, -2]} 
            icon={<ArrowRightLeft size={12} />} 
            label="Transitions" 
            opacity={(environmentState === 'normal' || environmentState === 'pattern') ? 1 : 0.2}
          />
          <SemanticLabel 
            position={[4, 3.5, -7]} 
            icon={<Volume2 size={12} />} 
            label="Noise" 
            opacity={(environmentState === 'normal' || environmentState === 'tuesday' || environmentState === 'pattern') ? 1 : 0.2}
          />
          <SemanticLabel 
            position={[4, 4.5, -10]} 
            icon={<Info size={12} />} 
            label="Instructions" 
            opacity={(environmentState === 'normal' || environmentState === 'monday' || environmentState === 'pattern') ? 1 : 0.2}
          />
        </group>
      )}

      {/* The Central Recessed Path */}
      <CurvedPathway />
      
      {/* The Student navigating the environment */}
      <StudentFigure isJudgeMode={isJudgeMode} judgeModeStep={judgeModeStep} scrollProgress={scrollProgress} environmentState={environmentState} />
    </group>
  );
}
