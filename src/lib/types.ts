// FrictionTrace — Core Types
// "Stop measuring the child. Start measuring the friction."

export type FrictionCategory =
  | 'noise'
  | 'unexpected_change'
  | 'instructions'
  | 'people'
  | 'transition'
  | 'dont_know';

export const CATEGORY_META: Record<FrictionCategory, { label: string; icon: string; color: string }> = {
  noise: { label: 'Noise', icon: '🔊', color: '#f59e0b' },
  unexpected_change: { label: 'Unexpected Change', icon: '🔄', color: '#ef4444' },
  instructions: { label: 'Instructions', icon: '📝', color: '#3b82f6' },
  people: { label: 'People', icon: '👥', color: '#8b5cf6' },
  transition: { label: 'Transition', icon: '↔️', color: '#06b6d4' },
  dont_know: { label: "Don't Know", icon: '❓', color: '#6b7280' },
};

export interface FrictionMoment {
  id: string;
  timestamp: string; // ISO string
  categories: FrictionCategory[];
  textNote?: string;
  voiceNoteBase64?: string;
  voiceNoteDuration?: number; // seconds
  ambientLevel?: number; // 0-100
  classContext?: string;
  aiAnalysis?: StructuredAnalysis;
}

export interface StructuredAnalysis {
  sensoryLoad?: string;
  uncertainty?: string;
  socialLoad?: string;
  environmentalFactors?: string[];
  suggestedSupports?: string[];
}

export interface FrictionPattern {
  id: string;
  title: string;
  description: string;
  evidenceCount: number;
  momentIds: string[];
  category?: FrictionCategory;
  confidence: 'low' | 'medium' | 'high';
  accommodation?: string;
}

export interface FrictionReceipt {
  id: string;
  createdAt: string;
  momentIds: string[];
  whatHappened: string;
  whatIExperienced: string;
  whatHelpedPreviously: string;
  whatIWantAdultsToKnow: string;
  studentEdited: boolean;
}

export interface SupportPreference {
  id: string;
  label: string;
  enabled: boolean;
  custom: boolean;
}

export const DEFAULT_SUPPORT_PREFERENCES: Omit<SupportPreference, 'id'>[] = [
  { label: 'Quiet space available', enabled: false, custom: false },
  { label: 'Written instructions', enabled: false, custom: false },
  { label: 'Advance warning before changes', enabled: false, custom: false },
  { label: 'Extra time for transitions', enabled: false, custom: false },
  { label: 'Reduced lighting', enabled: false, custom: false },
  { label: 'Noise-cancelling headphones allowed', enabled: false, custom: false },
  { label: 'Seat near exit', enabled: false, custom: false },
  { label: 'Break when overwhelmed', enabled: false, custom: false },
  { label: 'Fidget tools allowed', enabled: false, custom: false },
  { label: 'Alternative assessment format', enabled: false, custom: false },
];

export interface ClassPeriod {
  id: string;
  name: string;
  time?: string;
}

export interface UserSettings {
  name?: string;
  supportPreferences: SupportPreference[];
  classes: ClassPeriod[];
  accommodations: string[];
  onboardingComplete: boolean;
}
