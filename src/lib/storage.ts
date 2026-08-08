// FrictionTrace — Storage Layer
// "Your data never leaves this device unless you choose to share."

import {
  FrictionMoment,
  FrictionReceipt,
  UserSettings,
  DEFAULT_SUPPORT_PREFERENCES,
  SupportPreference,
} from './types';

const KEYS = {
  MOMENTS: 'frictiontrace_moments',
  SETTINGS: 'frictiontrace_settings',
  RECEIPTS: 'frictiontrace_receipts',
} as const;

// ── Helpers ──

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('FrictionTrace storage error:', e);
  }
}

// ── Moments ──

export function getMoments(): FrictionMoment[] {
  return getItem<FrictionMoment[]>(KEYS.MOMENTS, []);
}

export function getMomentById(id: string): FrictionMoment | undefined {
  return getMoments().find((m) => m.id === id);
}

export function addMoment(moment: Omit<FrictionMoment, 'id'>): FrictionMoment {
  const newMoment: FrictionMoment = { ...moment, id: generateId() };
  const moments = getMoments();
  moments.push(newMoment);
  setItem(KEYS.MOMENTS, moments);
  return newMoment;
}

export function updateMoment(id: string, updates: Partial<FrictionMoment>): void {
  const moments = getMoments().map((m) =>
    m.id === id ? { ...m, ...updates } : m
  );
  setItem(KEYS.MOMENTS, moments);
}

export function deleteMoment(id: string): void {
  const moments = getMoments().filter((m) => m.id !== id);
  setItem(KEYS.MOMENTS, moments);
}

export function clearAllMoments(): void {
  setItem(KEYS.MOMENTS, []);
}

// ── Settings ──

function defaultSettings(): UserSettings {
  return {
    supportPreferences: DEFAULT_SUPPORT_PREFERENCES.map((p) => ({
      ...p,
      id: generateId(),
    })),
    classes: [],
    accommodations: [],
    onboardingComplete: false,
  };
}

export function getSettings(): UserSettings {
  return getItem<UserSettings>(KEYS.SETTINGS, defaultSettings());
}

export function updateSettings(updates: Partial<UserSettings>): void {
  const current = getSettings();
  setItem(KEYS.SETTINGS, { ...current, ...updates });
}

export function addSupportPreference(label: string): void {
  const settings = getSettings();
  const newPref: SupportPreference = {
    id: generateId(),
    label,
    enabled: true,
    custom: true,
  };
  settings.supportPreferences.push(newPref);
  setItem(KEYS.SETTINGS, settings);
}

export function toggleSupportPreference(id: string): void {
  const settings = getSettings();
  settings.supportPreferences = settings.supportPreferences.map((p) =>
    p.id === id ? { ...p, enabled: !p.enabled } : p
  );
  setItem(KEYS.SETTINGS, settings);
}

// ── Receipts ──

export function getReceipts(): FrictionReceipt[] {
  return getItem<FrictionReceipt[]>(KEYS.RECEIPTS, []);
}

export function addReceipt(receipt: Omit<FrictionReceipt, 'id'>): FrictionReceipt {
  const newReceipt: FrictionReceipt = { ...receipt, id: generateId() };
  const receipts = getReceipts();
  receipts.push(newReceipt);
  setItem(KEYS.RECEIPTS, receipts);
  return newReceipt;
}

export function updateReceipt(id: string, updates: Partial<FrictionReceipt>): void {
  const receipts = getReceipts().map((r) =>
    r.id === id ? { ...r, ...updates } : r
  );
  setItem(KEYS.RECEIPTS, receipts);
}

export function deleteReceipt(id: string): void {
  const receipts = getReceipts().filter((r) => r.id !== id);
  setItem(KEYS.RECEIPTS, receipts);
}

// ── Export / Import ──

export function exportAllData(): string {
  return JSON.stringify({
    moments: getMoments(),
    settings: getSettings(),
    receipts: getReceipts(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }, null, 2);
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.moments) setItem(KEYS.MOMENTS, data.moments);
    if (data.settings) setItem(KEYS.SETTINGS, data.settings);
    if (data.receipts) setItem(KEYS.RECEIPTS, data.receipts);
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid data format' };
  }
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.MOMENTS);
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.RECEIPTS);
}
