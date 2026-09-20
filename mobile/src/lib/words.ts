import bundledDefault from '../data/words.default.json';
import { WordsData } from '../types';
import { getCachedWords, setCachedWords } from './storage';

// Public, read-only content file — anyone can fetch this, no auth needed.
// Only a device holding a valid GitHub token (see lib/github.ts, entered
// locally in the admin screen) can ever write to it.
export const WORDS_PUBLIC_URL = 'https://airfohsah.github.io/words.json';

export function getBundledDefaultWords(): WordsData {
  return bundledDefault as WordsData;
}

export interface LoadWordsResult {
  words: WordsData;
  source: 'cache' | 'bundled';
}

// Instant, offline-safe load for first paint: cached copy if we have one
// (reflects the last successful remote fetch, or a prior admin push on this
// device), otherwise the snapshot bundled into the app build.
export async function loadWordsFast(): Promise<LoadWordsResult> {
  const cached = await getCachedWords();
  if (cached) return { words: cached, source: 'cache' };
  return { words: getBundledDefaultWords(), source: 'bundled' };
}

export class WordsFetchError extends Error {}

export async function refreshWordsFromRemote(timeoutMs = 8000): Promise<WordsData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${WORDS_PUBLIC_URL}?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new WordsFetchError(`HTTP ${res.status}`);
    const json = (await res.json()) as WordsData;
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new WordsFetchError('Malformed word content');
    }
    await setCachedWords(json);
    return json;
  } catch (e) {
    if (e instanceof WordsFetchError) throw e;
    throw new WordsFetchError(e instanceof Error ? e.message : 'Network error');
  } finally {
    clearTimeout(timeout);
  }
}
