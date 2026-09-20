// Ports index.html's :root CSS custom properties 1:1 — this is a fixed
// dark theme (the web app has no light mode), so no adaptive scheme here.
export const colors = {
  bg: '#080b14',
  card: '#0f1420',
  card2: '#151c2e',
  accent: '#f5c518',
  accent2: '#ff5252',
  accent3: '#00e5a0',
  text: '#f0f0f0',
  muted: '#6b7a99',
  border: '#1e2a40',
} as const;

// Note: @expo-google-fonts/syne only ships up to 800 (ExtraBold) — the web
// version's CSS also requested a 900 weight, but no such static font file
// exists for Syne, so 800 is the heaviest available.
export const fonts = {
  display: 'Syne_800ExtraBold',
  displayBold: 'Syne_800ExtraBold',
  displaySemi: 'Syne_700Bold',
  body: 'Syne_400Regular',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
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
  if (difficulty === 'EASY') return colors.accent3;
  if (difficulty === 'MEDIUM') return colors.accent;
  if (difficulty === 'HARD') return colors.accent2;
  return colors.muted;
};
