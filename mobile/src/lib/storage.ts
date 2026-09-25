import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS, HistoryEntry, WordsData } from '../types';

const KEYS = {
  history: '@wbt/history',
  settings: '@wbt/settings',
  wordsCache: '@wbt/words-cache',
  wordsCacheUpdatedAt: '@wbt/words-cache-updated-at',
  githubConfig: '@wbt/github-config',
  wordsSha: '@wbt/words-sha',
  pushSubscribed: '@wbt/push-subscribed',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---- History / leaderboard ----
export async function getHistory(): Promise<HistoryEntry[]> {
  return readJson<HistoryEntry[]>(KEYS.history, []);
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const current = await getHistory();
  const next = [entry, ...current].slice(0, 20);
  await writeJson(KEYS.history, next);
  return next;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.history);
}

export async function setHistory(entries: HistoryEntry[]): Promise<void> {
  await writeJson(KEYS.history, entries.slice(0, 20));
}

// ---- Settings ----
export async function getSettings(): Promise<AppSettings> {
  return readJson<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeJson(KEYS.settings, settings);
}

// ---- Word content cache ----
export async function getCachedWords(): Promise<WordsData | null> {
  return readJson<WordsData | null>(KEYS.wordsCache, null);
}

export async function setCachedWords(words: WordsData): Promise<void> {
  await writeJson(KEYS.wordsCache, words);
  await AsyncStorage.setItem(KEYS.wordsCacheUpdatedAt, new Date().toISOString());
}

export async function getWordsCacheUpdatedAt(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.wordsCacheUpdatedAt);
}

// ---- GitHub config (owner/repo/path — not secret, the token itself lives in SecureStore) ----
export interface GithubConfig {
  owner: string;
  repo: string;
  path: string; // e.g. "words.json"
}

export const DEFAULT_GITHUB_CONFIG: GithubConfig = {
  owner: 'Airfohsah',
  repo: 'airfohsah.github.io',
  path: 'words.json',
};

export async function getGithubConfig(): Promise<GithubConfig> {
  return readJson<GithubConfig>(KEYS.githubConfig, DEFAULT_GITHUB_CONFIG);
}

export async function saveGithubConfig(config: GithubConfig): Promise<void> {
  await writeJson(KEYS.githubConfig, config);
}

export async function getWordsSha(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.wordsSha);
}

export async function setWordsSha(sha: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.wordsSha, sha);
}

// ---- Push notification subscription (word-list update alerts) ----
export async function getPushSubscribed(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.pushSubscribed)) === 'true';
}

export async function setPushSubscribed(): Promise<void> {
  await AsyncStorage.setItem(KEYS.pushSubscribed, 'true');
}

export async function wipeAllLocalData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
