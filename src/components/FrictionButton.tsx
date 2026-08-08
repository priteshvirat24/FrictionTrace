'use client';

import { useState, useCallback, useRef } from 'react';
import { FrictionCategory, CATEGORY_META } from '@/lib/types';

interface Props {
  onMomentLogged: (data: {
    categories: FrictionCategory[];
    textNote?: string;
    classContext?: string;
    voiceNoteBase64?: string;
    voiceNoteDuration?: number;
    ambientLevel?: number;
  }) => void;
  classes?: { id: string; name: string }[];
}

type FlowStep = 'button' | 'categories' | 'context' | 'confirmation';

export default function FrictionButton({ onMomentLogged, classes = [] }: Props) {
  const [step, setStep] = useState<FlowStep>('button');
  const [pressing, setPressing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<FrictionCategory[]>([]);
  const [textNote, setTextNote] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const categories: FrictionCategory[] = [
    'noise',
    'unexpected_change',
    'instructions',
    'people',
    'transition',
    'dont_know',
  ];

  const handlePressStart = useCallback(() => {
    setPressing(true);
    // Long press (2 seconds) = log without explanation
    pressTimerRef.current = setTimeout(() => {
      // Long press → log immediately with no categories
      onMomentLogged({ categories: [] });
      setPressing(false);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2500);
    }, 2000);
  }, [onMomentLogged]);

  const handlePressEnd = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (pressing) {
      setPressing(false);
      // Short press → go to category selection
      setStep('categories');

      // Trigger ring animation
      if (ringRef.current) {
        ringRef.current.classList.remove('animate');
        void ringRef.current.offsetWidth;
        ringRef.current.classList.add('animate');
      }
    }
  }, [pressing]);

  const toggleCategory = (cat: FrictionCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSkipToLog = () => {
    onMomentLogged({
      categories: selectedCategories,
    });
    resetAndConfirm();
  };

  const handleContinueToContext = () => {
    setStep('context');
  };

  const handleSubmitFull = () => {
    onMomentLogged({
      categories: selectedCategories,
      textNote: textNote.trim() || undefined,
      classContext: selectedClass || undefined,
    });
    resetAndConfirm();
  };

  const resetAndConfirm = () => {
    setStep('button');
    setSelectedCategories([]);
    setTextNote('');
    setSelectedClass('');
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2500);
  };

  const handleBack = () => {
    if (step === 'context') setStep('categories');
    else if (step === 'categories') setStep('button');
  };

  return (
    <>
      <div className="friction-button-container">
        {step === 'button' && (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <button
              className={`friction-button ${pressing ? 'pressing' : ''}`}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={() => {
                if (pressing) {
                  setPressing(false);
                  if (pressTimerRef.current) {
                    clearTimeout(pressTimerRef.current);
                    pressTimerRef.current = null;
                  }
                }
              }}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              aria-label="Something is hard right now - press to log a friction moment"
              id="friction-button-main"
            >
              <span className="friction-button-icon">⚡</span>
              <span className="friction-button-text">Something is hard right now</span>
            </button>
            <div className="friction-ring" ref={ringRef} />
            <p className="friction-button-hint">
              Tap to explain · Hold to log without explaining
            </p>
          </div>
        )}

        {step === 'categories' && (
          <div className="step-enter" style={{ width: '100%', maxWidth: '560px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                What kind of friction?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Pick as many as feel right, or skip entirely.
              </p>
            </div>

            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                  onClick={() => toggleCategory(cat)}
                  aria-pressed={selectedCategories.includes(cat)}
                  id={`category-${cat}`}
                >
                  <span className="category-chip-icon">{CATEGORY_META[cat].icon}</span>
                  <span>{CATEGORY_META[cat].label}</span>
                </button>
              ))}
            </div>

            <div className="btn-group" style={{ justifyContent: 'center', marginTop: '24px' }}>
              <button className="btn btn-ghost" onClick={handleBack}>
                ← Back
              </button>
              <button className="btn btn-secondary" onClick={handleSkipToLog}>
                Log as-is
              </button>
              <button className="btn btn-primary" onClick={handleContinueToContext}>
                Add details →
              </button>
            </div>
          </div>
        )}

        {step === 'context' && (
          <div className="step-enter context-panel">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                Add context
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                All of this is optional. Share only what feels right.
              </p>
            </div>

            <div className="context-field">
              <label className="context-label" htmlFor="friction-note">What&apos;s happening?</label>
              <textarea
                id="friction-note"
                className="context-input"
                placeholder="e.g., Everyone kept talking and then she changed the worksheet again..."
                value={textNote}
                onChange={(e) => setTextNote(e.target.value)}
                rows={3}
              />
            </div>

            {classes.length > 0 && (
              <div className="context-field">
                <label className="context-label" htmlFor="friction-class">Class / Period</label>
                <div className="select-wrapper">
                  <select
                    id="friction-class"
                    className="select-input"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Select class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>
            )}

            <div className="btn-group" style={{ justifyContent: 'center', marginTop: '8px' }}>
              <button className="btn btn-ghost" onClick={handleBack}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={handleSubmitFull}>
                Log this moment ✓
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation overlay */}
      {showConfirmation && (
        <div className="confirmation-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="confirmation-card glass-card">
            <div className="confirmation-icon">✓</div>
            <h3 className="confirmation-title">Noted.</h3>
            <p className="confirmation-text">
              You&apos;re doing great. This moment has been recorded — only you can see it.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
