'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings, addSupportPreference, toggleSupportPreference, clearAllData, exportAllData } from '@/lib/storage';
import { UserSettings, ClassPeriod } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [newAccommodation, setNewAccommodation] = useState('');
  const [newPreference, setNewPreference] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(getSettings());
  }, []);

  const refresh = () => setSettings(getSettings());

  const handleAddClass = () => {
    if (!newClassName.trim() || !settings) return;
    const newClass: ClassPeriod = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newClassName.trim(),
    };
    updateSettings({ classes: [...settings.classes, newClass] });
    setNewClassName('');
    refresh();
  };

  const handleRemoveClass = (id: string) => {
    if (!settings) return;
    updateSettings({ classes: settings.classes.filter((c) => c.id !== id) });
    refresh();
  };

  const handleAddAccommodation = () => {
    if (!newAccommodation.trim() || !settings) return;
    updateSettings({ accommodations: [...settings.accommodations, newAccommodation.trim()] });
    setNewAccommodation('');
    refresh();
  };

  const handleRemoveAccommodation = (index: number) => {
    if (!settings) return;
    const updated = [...settings.accommodations];
    updated.splice(index, 1);
    updateSettings({ accommodations: updated });
    refresh();
  };

  const handleTogglePreference = (id: string) => {
    toggleSupportPreference(id);
    refresh();
  };

  const handleAddPreference = () => {
    if (!newPreference.trim()) return;
    addSupportPreference(newPreference.trim());
    setNewPreference('');
    refresh();
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frictiontrace-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    refresh();
  };

  if (!mounted || !settings) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Customize FrictionTrace to match your needs. Everything stays on your device.
        </p>
      </div>

      {/* Support Preferences */}
      <div className="setting-group">
        <h2 className="setting-group-title">My Support Preferences</h2>
        <p className="setting-group-desc">
          What helps you? Toggle the ones that apply — AI will use these when finding patterns and generating receipts.
        </p>

        {settings.supportPreferences.map((pref) => (
          <div key={pref.id} className="setting-item">
            <span className="setting-item-label">
              {pref.custom && '✨ '}{pref.label}
            </span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={pref.enabled}
                onChange={() => handleTogglePreference(pref.id)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}

        <div className="add-row" style={{ marginTop: '12px' }}>
          <input
            className="add-input"
            placeholder="Add your own support preference..."
            value={newPreference}
            onChange={(e) => setNewPreference(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPreference()}
          />
          <button className="btn btn-secondary" onClick={handleAddPreference}>
            Add
          </button>
        </div>
      </div>

      {/* Classes */}
      <div className="setting-group">
        <h2 className="setting-group-title">My Classes</h2>
        <p className="setting-group-desc">
          Add your classes so you can tag friction moments with context.
        </p>

        <div className="class-tags">
          {settings.classes.map((cls) => (
            <span key={cls.id} className="class-tag">
              {cls.name}
              <span
                className="class-tag-remove"
                onClick={() => handleRemoveClass(cls.id)}
                role="button"
                tabIndex={0}
                aria-label={`Remove ${cls.name}`}
              >
                ×
              </span>
            </span>
          ))}
        </div>

        <div className="add-row">
          <input
            className="add-input"
            placeholder="e.g., Maths, English, PE..."
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
          />
          <button className="btn btn-secondary" onClick={handleAddClass}>
            Add
          </button>
        </div>
      </div>

      {/* Accommodations */}
      <div className="setting-group">
        <h2 className="setting-group-title">My Accommodation Plan</h2>
        <p className="setting-group-desc">
          Optionally add items from your existing accommodation plan. AI will check whether these were available when friction occurred.
        </p>

        <div className="class-tags">
          {settings.accommodations.map((acc, i) => (
            <span key={i} className="class-tag">
              {acc}
              <span
                className="class-tag-remove"
                onClick={() => handleRemoveAccommodation(i)}
                role="button"
                tabIndex={0}
                aria-label={`Remove ${acc}`}
              >
                ×
              </span>
            </span>
          ))}
        </div>

        <div className="add-row">
          <input
            className="add-input"
            placeholder="e.g., Quiet break when overwhelmed, Written instructions..."
            value={newAccommodation}
            onChange={(e) => setNewAccommodation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddAccommodation()}
          />
          <button className="btn btn-secondary" onClick={handleAddAccommodation}>
            Add
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="setting-group">
        <h2 className="setting-group-title">Your Data</h2>
        <p className="setting-group-desc">
          All your data is stored locally on this device. No server, no cloud, no tracking.
        </p>

        <div className="btn-group" style={{ gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            📥 Export all data (JSON)
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowClearConfirm(true)}
          >
            🗑 Delete all data
          </button>
        </div>

        {showClearConfirm && (
          <div className="glass-card" style={{
            marginTop: '12px',
            padding: '20px',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--accent-red)', marginBottom: '12px', fontWeight: '600' }}>
              Are you sure? This will permanently delete all your friction moments, receipts, and settings.
            </p>
            <div className="btn-group">
              <button className="btn btn-danger" onClick={handleClearAll}>
                Yes, delete everything
              </button>
              <button className="btn btn-ghost" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Privacy footer */}
      <div className="glass-card" style={{
        marginTop: '32px',
        textAlign: 'center',
        padding: '20px',
        background: 'rgba(34, 197, 94, 0.05)',
        borderColor: 'rgba(34, 197, 94, 0.1)',
      }}>
        <p style={{ fontSize: '14px', color: 'var(--accent-green)', fontWeight: '600', marginBottom: '4px' }}>
          🔒 Your Privacy Guarantee
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Your data never leaves this device unless you choose to share a Friction Receipt.
          <br />
          No webcam. No emotion detection. No diagnosis. No hidden monitoring.
          <br />
          <strong style={{ color: 'var(--accent-green)' }}>&ldquo;Nothing about me without me.&rdquo;</strong>
        </p>
      </div>
    </div>
  );
}
