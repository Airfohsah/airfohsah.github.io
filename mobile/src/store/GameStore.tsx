import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  ActiveGame,
  AppSettings,
  DEFAULT_SETTINGS,
  LogEntry,
  PlayMode,
  RoundMode,
  VersusPlayer,
  WordsData,
} from '../types';
import { buildQueue, freeCategoryKeys } from '../lib/gameEngine';
import { addHistoryEntry, getSettings, saveSettings } from '../lib/storage';
import { getBundledDefaultWords } from '../lib/words';

export type ResultsMode = 'mid' | 'round-complete' | 'final' | null;

interface GameStoreState {
  words: WordsData;
  settings: AppSettings;

  playMode: PlayMode;
  selectedCats: string[];
  playerCount: number;
  playerNames: string[];

  roundMode: RoundMode;
  wordCount: number;
  timerSeconds: number;
  totalRounds: number;
  currentRound: number;

  versusPlayers: VersusPlayer[];
  versusCurrentIdx: number;

  active: ActiveGame | null;
  resultsMode: ResultsMode;
  lastRoundSummary: { got: number; total: number; playerName?: string } | null;
  lastLog: LogEntry[];
  finalStandings: VersusPlayer[] | null;
}

function initialState(): GameStoreState {
  return {
    words: getBundledDefaultWords(),
    settings: DEFAULT_SETTINGS,
    playMode: 'versus',
    selectedCats: [],
    playerCount: 2,
    playerNames: ['Player 1', 'Player 2'],
    roundMode: 'words',
    wordCount: DEFAULT_SETTINGS.defaultWordCount,
    timerSeconds: DEFAULT_SETTINGS.defaultTimerSeconds,
    totalRounds: 1,
    currentRound: 1,
    versusPlayers: [],
    versusCurrentIdx: 0,
    active: null,
    resultsMode: null,
    lastRoundSummary: null,
    lastLog: [],
    finalStandings: null,
  };
}

function activeTotal(state: GameStoreState): number {
  if (!state.active) return 0;
  return state.roundMode === 'words' ? state.wordCount : state.active.index;
}

interface GameStoreValue {
  state: GameStoreState;
  activeTotal: number;
  setWords: (words: WordsData) => void;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;

  pickMode: (mode: PlayMode) => void;
  toggleCat: (key: string) => void;
  toggleAllCats: () => void;
  setPlayerCount: (n: number) => void;
  setPlayerName: (idx: number, name: string) => void;
  confirmPlayerNames: () => void;
  setRoundMode: (mode: RoundMode) => void;
  changeWordCount: (delta: number) => void;
  changeTimerSeconds: (delta: number) => void;
  changeTotalRounds: (delta: number) => void;

  startSolo: () => void;
  startVersus: () => void;
  beginActiveGame: () => void;
  markGot: () => void;
  markSkip: () => void;
  endActiveGame: () => Promise<void>;
  playAgain: () => void;
  resetToHome: () => void;
}

const GameStoreContext = createContext<GameStoreValue | null>(null);

export function GameStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameStoreState>(initialState);

  const setWords = useCallback((words: WordsData) => {
    setState((s) => ({ ...s, words }));
  }, []);

  const loadSettings = useCallback(async () => {
    const settings = await getSettings();
    setState((s) => ({
      ...s,
      settings,
      wordCount: settings.defaultWordCount,
      timerSeconds: settings.defaultTimerSeconds,
    }));
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    setState((s) => {
      const next = { ...s.settings, ...partial };
      saveSettings(next);
      return { ...s, settings: next };
    });
  }, []);

  const pickMode = useCallback((mode: PlayMode) => {
    setState((s) => ({ ...s, playMode: mode }));
  }, []);

  const toggleCat = useCallback((key: string) => {
    setState((s) => {
      if (s.words[key]?.paid) return s;
      const has = s.selectedCats.includes(key);
      return {
        ...s,
        selectedCats: has ? s.selectedCats.filter((k) => k !== key) : [...s.selectedCats, key],
      };
    });
  }, []);

  const toggleAllCats = useCallback(() => {
    setState((s) => {
      const free = freeCategoryKeys(s.words);
      const allSelected = free.length > 0 && free.every((k) => s.selectedCats.includes(k));
      return { ...s, selectedCats: allSelected ? [] : free };
    });
  }, []);

  const setPlayerCount = useCallback((n: number) => {
    setState((s) => {
      const count = Math.max(2, Math.min(10, n));
      const names = Array.from({ length: count }, (_, i) => s.playerNames[i] || `Player ${i + 1}`);
      return { ...s, playerCount: count, playerNames: names };
    });
  }, []);

  const setPlayerName = useCallback((idx: number, name: string) => {
    setState((s) => {
      const names = s.playerNames.slice();
      names[idx] = name;
      return { ...s, playerNames: names };
    });
  }, []);

  const confirmPlayerNames = useCallback(() => {
    setState((s) => ({
      ...s,
      playerNames: s.playerNames.map((n, i) => (n.trim() ? n.trim() : `Player ${i + 1}`)),
    }));
  }, []);

  const setRoundMode = useCallback((mode: RoundMode) => {
    setState((s) => ({ ...s, roundMode: mode }));
  }, []);

  const changeWordCount = useCallback((delta: number) => {
    setState((s) => ({ ...s, wordCount: Math.max(5, Math.min(100, s.wordCount + delta)) }));
  }, []);

  const changeTimerSeconds = useCallback((delta: number) => {
    setState((s) => ({ ...s, timerSeconds: Math.max(30, Math.min(180, s.timerSeconds + delta)) }));
  }, []);

  const changeTotalRounds = useCallback((delta: number) => {
    setState((s) => ({ ...s, totalRounds: Math.max(1, Math.min(10, s.totalRounds + delta)) }));
  }, []);

  const startSolo = useCallback(() => {
    setState((s) => ({
      ...s,
      versusPlayers: [{ name: 'Solo', totalScore: 0, rounds: [] }],
      versusCurrentIdx: 0,
      currentRound: 1,
      resultsMode: null,
    }));
  }, []);

  const startVersus = useCallback(() => {
    setState((s) => ({
      ...s,
      versusPlayers: s.playerNames
        .slice(0, s.playerCount)
        .map((name) => ({ name, totalScore: 0, rounds: [] })),
      versusCurrentIdx: 0,
      currentRound: 1,
      resultsMode: null,
    }));
  }, []);

  const beginActiveGame = useCallback(() => {
    setState((s) => {
      const queue = buildQueue(s.words, s.selectedCats, s.roundMode, s.wordCount);
      return { ...s, active: { queue, index: 0, got: 0, log: [] } };
    });
  }, []);

  const markGot = useCallback(() => {
    setState((s) => {
      if (!s.active) return s;
      if (s.active.index >= s.active.queue.length) return s;
      const item = s.active.queue[s.active.index];
      return {
        ...s,
        active: {
          ...s.active,
          got: s.active.got + 1,
          index: s.active.index + 1,
          log: [...s.active.log, { word: item.word, got: true }],
        },
      };
    });
  }, []);

  const markSkip = useCallback(() => {
    setState((s) => {
      if (!s.active || s.active.queue.length === 0) return s;
      const idx = s.active.index % s.active.queue.length;
      const item = s.active.queue[idx];
      return {
        ...s,
        active: {
          ...s.active,
          index: s.active.index + 1,
          log: [...s.active.log, { word: item.word, got: false }],
        },
      };
    });
  }, []);

  const endActiveGame = useCallback(async () => {
    // Compute the next state ourselves (from the current closure's `state`,
    // kept fresh via the dependency array below) instead of trying to read
    // it back out of the setState updater — that updater isn't guaranteed
    // to run synchronously, so capturing its result into an outer variable
    // and checking it right after (the previous approach here) silently
    // never fired, and history never got saved.
    const s = state;
    if (!s.active) return;

    const total = s.roundMode === 'words' ? s.wordCount : s.active.index;
    const lastRoundSummary = {
      got: s.active.got,
      total,
      playerName: s.versusPlayers[s.versusCurrentIdx]?.name,
    };

    let players = s.versusPlayers;
    if (players.length > 0) {
      players = players.map((p, i) =>
        i === s.versusCurrentIdx
          ? { ...p, totalScore: p.totalScore + s.active!.got, rounds: [...p.rounds, s.active!.got] }
          : p
      );
    }

    const nextIdx = s.versusCurrentIdx + 1;
    const lastLog = s.active.log;
    let next: GameStoreState;
    if (nextIdx < players.length) {
      next = {
        ...s,
        versusPlayers: players,
        versusCurrentIdx: nextIdx,
        active: null,
        resultsMode: 'mid',
        lastRoundSummary,
        lastLog,
      };
    } else if (s.currentRound < s.totalRounds) {
      next = {
        ...s,
        versusPlayers: players,
        versusCurrentIdx: 0,
        currentRound: s.currentRound + 1,
        active: null,
        resultsMode: 'round-complete',
        lastRoundSummary,
        lastLog,
      };
    } else {
      const finalStandings = [...players].sort((a, b) => b.totalScore - a.totalScore);
      next = {
        ...s,
        versusPlayers: players,
        active: null,
        resultsMode: 'final',
        lastRoundSummary,
        lastLog,
        finalStandings,
      };
    }

    setState(next);

    if (next.resultsMode === 'final') {
      await addHistoryEntry({
        date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }),
        categories: next.selectedCats.map((k) => next.words[k]?.name).filter(Boolean) as string[],
        players: (next.finalStandings ?? []).map((p) => ({ name: p.name, score: p.totalScore })),
      });
    }
  }, [state]);

  const playAgain = useCallback(() => {
    setState((s) => ({
      ...s,
      versusPlayers: s.versusPlayers.map((p) => ({ ...p, totalScore: 0, rounds: [] })),
      versusCurrentIdx: 0,
      currentRound: 1,
      resultsMode: null,
      finalStandings: null,
      lastRoundSummary: null,
    }));
  }, []);

  const resetToHome = useCallback(() => {
    setState((s) => ({
      ...initialState(),
      words: s.words,
      settings: s.settings,
      wordCount: s.settings.defaultWordCount,
      timerSeconds: s.settings.defaultTimerSeconds,
    }));
  }, []);

  const value = useMemo<GameStoreValue>(
    () => ({
      state,
      activeTotal: activeTotal(state),
      setWords,
      loadSettings,
      updateSettings,
      pickMode,
      toggleCat,
      toggleAllCats,
      setPlayerCount,
      setPlayerName,
      confirmPlayerNames,
      setRoundMode,
      changeWordCount,
      changeTimerSeconds,
      changeTotalRounds,
      startSolo,
      startVersus,
      beginActiveGame,
      markGot,
      markSkip,
      endActiveGame,
      playAgain,
      resetToHome,
    }),
    [
      state,
      setWords,
      loadSettings,
      updateSettings,
      pickMode,
      toggleCat,
      toggleAllCats,
      setPlayerCount,
      setPlayerName,
      confirmPlayerNames,
      setRoundMode,
      changeWordCount,
      changeTimerSeconds,
      changeTotalRounds,
      startSolo,
      startVersus,
      beginActiveGame,
      markGot,
      markSkip,
      endActiveGame,
      playAgain,
      resetToHome,
    ]
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore(): GameStoreValue {
  const ctx = useContext(GameStoreContext);
  if (!ctx) throw new Error('useGameStore must be used within a GameStoreProvider');
  return ctx;
}
