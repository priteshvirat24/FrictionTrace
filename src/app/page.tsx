'use client';

import { useState, useEffect, useCallback } from 'react';
import FrictionButton from '@/components/FrictionButton';
import Onboarding from '@/components/Onboarding';
import { FrictionCategory } from '@/lib/types';
import { addMoment, getSettings, updateSettings, getMoments } from '@/lib/storage';

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [momentCount, setMomentCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      setShowOnboarding(true);
    }
    setClasses(settings.classes);
    setMomentCount(getMoments().length);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    updateSettings({ onboardingComplete: true });
    setShowOnboarding(false);
  }, []);

  const handleMomentLogged = useCallback(
    (data: {
      categories: FrictionCategory[];
      textNote?: string;
      classContext?: string;
      voiceNoteBase64?: string;
      voiceNoteDuration?: number;
      ambientLevel?: number;
    }) => {
      addMoment({
        timestamp: new Date().toISOString(),
        ...data,
      });
      setMomentCount((c) => c + 1);
    },
    []
  );

  if (!mounted) return null;

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        {momentCount > 0 && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {momentCount} moment{momentCount !== 1 ? 's' : ''} recorded
          </p>
        )}
      </div>

      <FrictionButton
        onMomentLogged={handleMomentLogged}
        classes={classes}
      />
    </>
  );
}
