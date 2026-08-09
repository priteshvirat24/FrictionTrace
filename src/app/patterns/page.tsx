'use client';

import { useState, useEffect } from 'react';
import { FrictionMoment, FrictionPattern, CATEGORY_META, FrictionCategory } from '@/lib/types';
import { getMoments, getSettings } from '@/lib/storage';

export default function PatternsPage() {
  const [moments, setMoments] = useState<FrictionMoment[]>([]);
  const [patterns, setPatterns] = useState<FrictionPattern[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMoments(getMoments());
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const settings = getSettings();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moments, settings }),
      });
      const data = await res.json();
      setPatterns(data.patterns || []);
      setSummary(data.summary || '');
      setAnalyzed(true);
    } catch (err) {
      console.error('Analysis failed:', err);
      setSummary('Analysis encountered an issue. Your data is safe — try again in a moment.');
      setAnalyzed(true);
    } finally {
      setLoading(false);
    }
  };

  // Category distribution
  const categoryDistribution = moments.reduce<Record<string, number>>((acc, m) => {
    m.categories.forEach((cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    if (m.categories.length === 0) {
      acc['unspecified'] = (acc['unspecified'] || 0) + 1;
    }
    return acc;
  }, {});

  const maxCategoryCount = Math.max(...Object.values(categoryDistribution), 1);

  // Day of week distribution
  const dayDistribution = moments.reduce<Record<string, number>>((acc, m) => {
    const day = new Date(m.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  // Hour distribution
  const hourDistribution = moments.reduce<Record<string, number>>((acc, m) => {
    const hour = new Date(m.timestamp).getHours();
    const label = `${hour.toString().padStart(2, '0')}:00`;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  if (!mounted) return null;

  if (moments.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Patterns</h1>
          <p className="page-subtitle">AI-discovered patterns in your friction data.</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">Not enough data yet</h3>
          <p className="empty-state-text">
            Log a few friction moments first, then come back here to discover patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Patterns</h1>
        <p className="page-subtitle">
          AI discovers when and where friction clusters — measuring the environment, not you.
        </p>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card glass-card">
          <div className="stat-value">{moments.length}</div>
          <div className="stat-label">Total Moments</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-value">{Object.keys(categoryDistribution).length}</div>
          <div className="stat-label">Friction Types</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-value">
            {Object.keys(dayDistribution).length}
          </div>
          <div className="stat-label">Days Tracked</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>
            {patterns.length}
          </div>
          <div className="stat-label">Patterns Found</div>
        </div>
      </div>

      {/* Category distribution */}
      <div className="glass-card distribution-chart" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Friction by Type
        </h3>
        {Object.entries(categoryDistribution)
          .sort(([, a], [, b]) => b - a)
          .map(([cat, count]) => {
            const meta = CATEGORY_META[cat as FrictionCategory];
            return (
              <div key={cat} className="distribution-row">
                <span className="distribution-label">
                  {meta ? `${meta.icon} ${meta.label}` : '⚡ Unspecified'}
                </span>
                <div className="distribution-bar-bg">
                  <div
                    className="distribution-bar"
                    style={{
                      width: `${(count / maxCategoryCount) * 100}%`,
                      background: meta?.color || 'var(--text-muted)',
                    }}
                  />
                </div>
                <span className="distribution-count">{count}</span>
              </div>
            );
          })}
      </div>

      {/* Time distribution */}
      {Object.keys(hourDistribution).length > 0 && (
        <div className="glass-card distribution-chart" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Friction by Time of Day
          </h3>
          {Object.entries(hourDistribution)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([hour, count]) => (
              <div key={hour} className="distribution-row">
                <span className="distribution-label">🕐 {hour}</span>
                <div className="distribution-bar-bg">
                  <div
                    className="distribution-bar"
                    style={{
                      width: `${(count / Math.max(...Object.values(hourDistribution))) * 100}%`,
                      background: 'var(--accent-cyan)',
                    }}
                  />
                </div>
                <span className="distribution-count">{count}</span>
              </div>
            ))}
        </div>
      )}

      {/* AI Analysis */}
      <div style={{ textAlign: 'center', margin: '32px 0 24px' }}>
        <button
          className="btn btn-primary"
          onClick={runAnalysis}
          disabled={loading || moments.length < 2}
          id="analyze-button"
          style={{ padding: '14px 32px', fontSize: '15px' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px' }} />
              Analyzing patterns...
            </>
          ) : analyzed ? (
            '🔄 Re-analyze patterns'
          ) : (
            '🔍 Discover patterns with AI'
          )}
        </button>
        {moments.length < 2 && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Need at least 2 moments to find patterns.
          </p>
        )}
      </div>

      {/* AI Results */}
      {analyzed && summary && (
        <div className="summary-card glass-card step-enter">
          <p>{summary}</p>
        </div>
      )}

      {patterns.length > 0 && (
        <div className="patterns-grid">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`glass-card pattern-card confidence-${pattern.confidence} step-enter`}
            >
              <h3 className="pattern-title">{pattern.title}</h3>
              <p className="pattern-description">{pattern.description}</p>
              <div className="pattern-meta">
                <span className="pattern-evidence">
                  📊 {pattern.evidenceCount} moment{pattern.evidenceCount !== 1 ? 's' : ''}
                </span>
                <span className={`pattern-confidence confidence-${pattern.confidence}`}>
                  {pattern.confidence} confidence
                </span>
              </div>
              {pattern.accommodation && (
                <div className="pattern-accommodation">
                  <div className="pattern-accommodation-label">What might help</div>
                  {pattern.accommodation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
