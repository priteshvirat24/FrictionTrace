'use client';

import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: '⚡',
    title: 'Welcome to FrictionTrace',
    text: 'This tool doesn\'t measure you. It measures <highlight>friction</highlight> — the moments when school creates a mismatch with what you need.',
  },
  {
    icon: '🎯',
    title: 'One button. Your control.',
    text: 'When something feels hard, press the button. You can explain what\'s happening — or not. <highlight>You choose what to share, always.</highlight>',
  },
  {
    icon: '🔍',
    title: 'Find patterns. Own your story.',
    text: 'Over time, AI finds patterns in <highlight>when and where friction happens</highlight> — not what\'s "wrong" with you. Then you can create a Friction Receipt to show adults what actually helps.',
  },
];

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];

  const renderText = (text: string) => {
    const parts = text.split(/<highlight>(.*?)<\/highlight>/g);
    return parts.map((part, i) => 
      i % 2 === 1 ? (
        <span key={i} className="onboarding-highlight">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card glass-card">
        <div className="onboarding-step-indicator">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot ${i === step ? 'active' : ''}`}
            />
          ))}
        </div>

        <div className="step-enter" key={step}>
          <div className="onboarding-icon">{current.icon}</div>
          <h2 className="onboarding-title">{current.title}</h2>
          <p className="onboarding-text">{renderText(current.text)}</p>
        </div>

        <div className="onboarding-buttons">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onComplete}>
              I&apos;m ready ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
