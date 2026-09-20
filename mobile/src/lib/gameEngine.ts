import { QueueItem, RoundMode, WordsData } from '../types';

// Fisher-Yates — the web version used `.sort(() => Math.random() - 0.5)`,
// which is a well-known biased shuffle. Fixing it here since we're already
// rebuilding this logic from scratch (not introducing new behavior, just a
// correct implementation of the same "shuffle the word pool" step).
export function shuffle<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildQueue(
  words: WordsData,
  selectedCatKeys: string[],
  roundMode: RoundMode,
  wordCount: number
): QueueItem[] {
  const pool: QueueItem[] = [];
  for (const key of selectedCatKeys) {
    const cat = words[key];
    if (!cat) continue;
    cat.words.forEach((w) => pool.push({ word: w, cat: cat.name }));
  }
  const shuffled = shuffle(pool);
  return roundMode === 'words' ? shuffled.slice(0, wordCount) : shuffled;
}

export function freeCategoryKeys(words: WordsData): string[] {
  return Object.keys(words).filter((k) => !words[k].paid && words[k].enabled !== false);
}

export function playableCategoryKeys(words: WordsData): string[] {
  // enabled categories only (paid ones still show, locked, in the UI —
  // handled at the screen level, not here).
  return Object.keys(words).filter((k) => words[k].enabled !== false);
}
