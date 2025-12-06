export enum BreathPhase {
  Inhale = 'Inhale',
  HoldTop = 'HoldTop',
  Exhale = 'Exhale',
  HoldBottom = 'HoldBottom',
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  benefit: string;
  inhale: number; // Duration in seconds
  holdTop: number;
  exhale: number;
  holdBottom: number;
  tags: string[];
}

export type Screen = 'home' | 'simulator' | 'custom-setup';

export interface AppState {
  currentScreen: Screen;
  selectedPattern: BreathingPattern | null;
}