
export type ThemeType = 'acacia' | 'sham' | 'light' | 'pastel' | 'night' | 'shahba';
export type Language = 'ar' | 'en';

export interface ThemeColors {
  bg: string;
  card: string;
  display: string;
  displayText: string;
  button: string;
  buttonText: string;
  operator: string;
  operatorText: string;
  equal: string;
  equalText: string;
  accent: string;
  gridBg: string;
  gridBorder: string;
  textAccent: string; // Tailwind class for specialized text (e.g., acacia-text or similar)
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface CalculatorState {
  currentValue: string;
  previousValue: string | null;
  operator: string | null;
  waitingForOperand: boolean;
  memoryValue: number;
}

export interface CustomSettings {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  isGoogleLinked?: boolean;
  userEmail?: string;
  lastSyncTimestamp?: number;
  autoSyncEnabled?: boolean;
}
