'use client';

import { useState, useEffect } from 'react';
import Timeline from '@/components/Timeline';
import { FrictionMoment } from '@/lib/types';
import { getMoments, deleteMoment } from '@/lib/storage';

export default function TimelinePage() {
  const [moments, setMoments] = useState<FrictionMoment[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMoments(getMoments());
  }, []);

  const handleDelete = (id: string) => {
    deleteMoment(id);
    setMoments(getMoments());
  };

  if (!mounted) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Timeline</h1>
        <p className="page-subtitle">
          Every moment you&apos;ve logged — your record of when school created friction.
        </p>
      </div>

      <Timeline moments={moments} onDeleteMoment={handleDelete} />
    </div>
  );
}
