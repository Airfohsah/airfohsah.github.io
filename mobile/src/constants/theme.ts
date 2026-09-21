// The app is pinned to this single dark illustrated palette everywhere —
// no light-mode variant (see history for the retired light/dark toggle).
export interface Palette {
  bg: string;
  card: string;
  card2: string;
  accent: string;
  accent2: string;
  accent3: string;
  text: string;
  muted: string;
  border: string;
}

export const darkColors: Palette = {
  bg: '#080b14',
  card: '#0f1420',
  card2: '#151c2e',
  accent: '#f5c518',
  accent2: '#ff5252',
  accent3: '#00e5a0',
  text: '#f0f0f0',
  muted: '#6b7a99',
  border: '#1e2a40',
};

export const fonts = {
  display: 'Syne_800ExtraBold',
  displayBold: 'Syne_800ExtraBold',
  displaySemi: 'Syne_700Bold',
  body: 'Syne_400Regular',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
  brush: 'PermanentMarker_400Regular',
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 20,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const difficultyColor = (difficulty?: string) => {
  if (difficulty === 'EASY') return darkColors.accent3;
  if (difficulty === 'MEDIUM') return darkColors.accent;
  if (difficulty === 'HARD') return darkColors.accent2;
  return darkColors.muted;
};
