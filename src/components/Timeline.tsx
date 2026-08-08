'use client';

import { useState } from 'react';
import { FrictionMoment, CATEGORY_META } from '@/lib/types';

interface Props {
  moments: FrictionMoment[];
  onDeleteMoment?: (id: string) => void;
}

export default function Timeline({ moments, onDeleteMoment }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter moments
  const filtered = filter === 'all'
    ? moments
    : moments.filter((m) => m.categories.includes(filter as never));

  // Group by day
  const grouped = filtered.reduce<Record<string, FrictionMoment[]>>((acc, moment) => {
    const date = new Date(moment.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(moment);
    return acc;
  }, {});

  // Sort days newest first
  const sortedDays = Object.entries(grouped).sort((a, b) => {
    const dateA = new Date(a[1][0].timestamp).getTime();
    const dateB = new Date(b[1][0].timestamp).getTime();
    return dateB - dateA;
  });

  const getHeatColor = (count: number) => {
    if (count <= 1) return 'var(--accent-green)';
    if (count <= 2) return 'var(--accent-amber)';
    if (count <= 3) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (moments.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📅</div>
        <h3 className="empty-state-title">No moments logged yet</h3>
        <p className="empty-state-text">
          When something feels hard, press the button on the Home page. Your friction moments will appear here.
        </p>
      </div>
    );
  }

  const allCategories = Array.from(
    new Set(moments.flatMap((m) => m.categories))
  );

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <button
          className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({moments.length})
        </button>
        {allCategories.map((cat) => {
          const count = moments.filter((m) => m.categories.includes(cat)).length;
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              className={`filter-pill ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(filter === cat ? 'all' : cat)}
            >
              {meta?.icon} {meta?.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {sortedDays.map(([date, dayMoments]) => (
        <div key={date} className="timeline-day">
          <div className="timeline-day-header">
            <div
              className="timeline-heat-dot"
              style={{ background: getHeatColor(dayMoments.length) }}
            />
            <span className="timeline-day-label">{date}</span>
            <span className="timeline-day-count">
              {dayMoments.length} moment{dayMoments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {dayMoments
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((moment) => (
              <div
                key={moment.id}
                className="moment-card"
                onClick={() => setExpandedId(expandedId === moment.id ? null : moment.id)}
                role="button"
                tabIndex={0}
                aria-expanded={expandedId === moment.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedId(expandedId === moment.id ? null : moment.id);
                  }
                }}
              >
                <span className="moment-time">{formatTime(moment.timestamp)}</span>
                <div className="moment-body">
                  {moment.categories.length > 0 ? (
                    <div className="moment-categories">
                      {moment.categories.map((cat) => {
                        const meta = CATEGORY_META[cat];
                        return (
                          <span
                            key={cat}
                            className="moment-category-tag"
                            style={{ color: meta?.color, borderColor: meta?.color, border: `1px solid ${meta?.color}30` }}
                          >
                            {meta?.icon} {meta?.label}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="moment-categories">
                      <span className="moment-category-tag" style={{ color: 'var(--text-muted)' }}>
                        ⚡ Something was hard
                      </span>
                    </div>
                  )}

                  {moment.textNote && (
                    <p className="moment-note">&ldquo;{moment.textNote}&rdquo;</p>
                  )}

                  <div className="moment-meta">
                    {moment.classContext && (
                      <span>📚 {moment.classContext}</span>
                    )}
                    {moment.ambientLevel !== undefined && (
                      <span className="moment-ambient">
                        🔊 {moment.ambientLevel}%
                      </span>
                    )}
                    {moment.voiceNoteBase64 && (
                      <span className="moment-voice">
                        🎙 Voice note ({moment.voiceNoteDuration}s)
                      </span>
                    )}
                  </div>

                  {/* Expanded view */}
                  {expandedId === moment.id && (
                    <div className="step-enter" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      {moment.voiceNoteBase64 && (
                        <div style={{ marginBottom: '12px' }}>
                          <audio controls src={moment.voiceNoteBase64} style={{ width: '100%', height: '36px' }} />
                        </div>
                      )}
                      {moment.aiAnalysis && (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          <strong>AI Analysis:</strong>
                          {moment.aiAnalysis.environmentalFactors?.map((f, i) => (
                            <span key={i} style={{ display: 'block', paddingLeft: '8px' }}>• {f}</span>
                          ))}
                        </div>
                      )}
                      {onDeleteMoment && (
                        <button
                          className="btn btn-danger"
                          style={{ marginTop: '8px', fontSize: '12px', padding: '6px 12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMoment(moment.id);
                          }}
                        >
                          Delete moment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
