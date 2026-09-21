export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | '';

export interface WordCategory {
  name: string;
  icon: string;
  difficulty: Difficulty;
  paid: boolean;
  enabled: boolean;
  words: string[];
}

export type WordsData = Record<string, WordCategory>;

export interface QueueItem {
  word: string;
  cat: string;
}

export interface LogEntry {
  word: string;
  got: boolean;
}

export interface ActiveGame {
  queue: QueueItem[];
  index: number;
  got: number;
  log: LogEntry[];
}

export type PlayMode = 'solo' | 'versus';
export type RoundMode = 'words' | 'timer';

export interface VersusPlayer {
  name: string;
  totalScore: number;
  rounds: number[];
}

export interface HistoryPlayerResult {
  name: string;
  score: number;
}

export interface HistoryEntry {
  date: string;
  categories: string[];
  players: HistoryPlayerResult[];
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  tiltEnabled: boolean;
  soundEnabled: boolean;
  defaultWordCount: number;
  defaultTimerSeconds: number;
  themePreference: ThemePreference;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tiltEnabled: false,
  soundEnabled: true,
  defaultWordCount: 20,
  defaultTimerSeconds: 60,
  themePreference: 'system',
};

// ===== Backup file shape (Milestone 6) =====
export interface BackupFileV1 {
  schemaVersion: 1;
  exportedAt: string; // ISO date
  app: 'watin-be-this';
  words: WordsData;
  history: HistoryEntry[];
  settings: AppSettings;
}
