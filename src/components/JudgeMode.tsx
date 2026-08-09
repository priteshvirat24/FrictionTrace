'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  isActive: boolean;
  onClose: () => void;
  onStepChange?: (step: number) => void;
}

// Cinematic sequence timing (30s total)
// 0.0 - 2.5s: ENTRY (Step 1)
// 2.5 - 6.0s: OPENING (Step 2)
// 6.0 - 10.0s: MONDAY (Step 3)
// 10.0 - 14.0s: TUESDAY (Step 4)
// 14.0 - 18.0s: WEDNESDAY (Step 5)
// 18.0 - 21.5s: THURSDAY (Step 6)
// 21.5 - 25.0s: PATTERN (Step 7)
// 25.0 - 27.5s: INVESTIGATION (Step 8)
// 27.5 - 30.0s: FINAL (Step 9)

const PHASES = [
  { step: 1, startTime: 0, text: "SCHOOLS SEE THE MOMENT", sub: "SOMETHING GOES WRONG.", duration: 2.5 },
  { step: 2, startTime: 2.5, text: "MONDAY", sub: "The assignment changes verbally.", duration: 3.5 },
  { step: 3, startTime: 6.0, text: "TUESDAY", sub: "The cafeteria is too loud.", duration: 4.0 },
  { step: 4, startTime: 10.0, text: "WEDNESDAY", sub: "The schedule changes without warning.", duration: 4.0 },
  { step: 5, startTime: 14.0, text: "THURSDAY", sub: "The student shuts down.", duration: 4.0 },
  { step: 6, startTime: 18.0, text: "BUT THURSDAY", sub: "WASN'T THE WHOLE STORY.", duration: 3.5 },
  { step: 7, startTime: 21.5, text: "FRICTIONTRACE", sub: "SEES THE WHOLE WEEK.", duration: 3.5 },
  { step: 8, startTime: 25.0, text: "AI INVESTIGATES", sub: "THE PATTERN.", duration: 2.5 },
  { step: 9, startTime: 27.5, text: "THE STUDENT DECIDES", sub: "WHAT TO SHARE.", duration: 2.5 },
];

export default function JudgeMode({ isActive, onClose, onStepChange }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      setCurrentStep(0);
      if (onStepChange) onStepChange(0);
      return;
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const timeInSeconds = (now - startTime) / 1000;
      setElapsed(timeInSeconds);

      if (timeInSeconds >= 30) {
        if (onClose) onClose();
        return;
      }

      // Determine step
      let newStep = 1;
      for (let i = PHASES.length - 1; i >= 0; i--) {
        if (timeInSeconds >= PHASES[i].startTime) {
          newStep = PHASES[i].step;
          break;
        }
      }

      setCurrentStep(newStep);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]); // DO NOT add onClose to dependencies, it will cause infinite timer resets on every parent render!

  // Sync step changes to parent safely
  useEffect(() => {
    if (isActive && onStepChange && currentStep > 0) {
      onStepChange(currentStep);
    }
  }, [currentStep, isActive, onStepChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isActive) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);

  if (!isActive || currentStep === 0) return null;

  const currentPhase = PHASES.find(p => p.step === currentStep) || PHASES[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60, // Above the 3D canvas
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '2rem', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`phase-${currentStep}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}
            >
              <h1 style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '4rem', 
                fontWeight: 800, 
                color: '#3A261D',
                margin: 0,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase'
              }}>
                {currentPhase.text}
              </h1>
              
              {currentPhase.sub && (
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 500,
                  color: '#88624E',
                  margin: 0
                }}>
                  {currentPhase.sub}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* AI Investigation Sequence (Rapid Sub-steps) */}
          {currentStep === 8 && (
            <div style={{ position: 'absolute', top: '100%', marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
              {['OBSERVE', 'RETRIEVE', 'COMPARE', 'VALIDATE', 'EXPLAIN'].map((action, i) => (
                <motion.div
                  key={action}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: elapsed >= 25 + (i * 0.4) ? 1 : 0, scale: elapsed >= 25 + (i * 0.4) ? 1 : 0.9 }}
                  style={{
                    background: '#EDDED0',
                    color: '#985D48',
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  {action}
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div style={{ position: 'absolute', bottom: '3rem', left: '4rem', right: '4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#C08C72', minWidth: '20px' }}>
            {Math.floor(elapsed).toString().padStart(2, '0')}
          </div>
          <div style={{ flex: 1, height: '2px', background: 'rgba(192, 140, 114, 0.2)', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              left: 0, top: 0, bottom: 0, 
              background: '#985D48',
              width: `${(elapsed / 30) * 100}%`
            }} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#C08C72', minWidth: '20px' }}>
            30
          </div>
        </div>

        {/* Exit Control */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '2rem',
            right: '3rem',
            zIndex: 20,
            color: '#88624E',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            pointerEvents: 'auto'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          ESC TO EXIT
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
