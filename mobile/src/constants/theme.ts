// Two palettes (dark = the original design, light = its counterpart), swapped
// at runtime by ThemeContext based on system preference or an explicit
// user override (Settings). Every screen reads colors via useTheme()
// instead of importing a static palette, so switching is instant everywhere.
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

export const lightColors: Palette = {
  bg: '#f5f6fa',
  card: '#ffffff',
  card2: '#eef0f6',
  accent: '#c98f00',
  accent2: '#d63f3f',
  accent3: '#00a870',
  text: '#12151f',
  muted: '#5b6478',
  border: '#dde1ec',
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

export const difficultyColor = (difficulty?: string, colors: Palette = darkColors) => {
  if (difficulty === 'EASY') return colors.accent3;
  if (difficulty === 'MEDIUM') return colors.accent;
  if (difficulty === 'HARD') return colors.accent2;
  return colors.muted;
};
