import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, Palette } from '../constants/theme';
import { ThemePreference } from '../types';

interface ThemeValue {
  scheme: 'light' | 'dark';
  colors: Palette;
}

const ThemeContext = createContext<ThemeValue>({ scheme: 'dark', colors: darkColors });

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();
  const scheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
  const value = useMemo<ThemeValue>(
    () => ({ scheme, colors: scheme === 'light' ? lightColors : darkColors }),
    [scheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
