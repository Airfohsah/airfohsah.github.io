import { useCallback, useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkColors as colors } from '../constants/theme';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string, durationMs = 2500) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(null), durationMs);
  }, []);
  return { message, showToast };
}

export function Screen({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  // Applied centrally here (rather than per-screen SafeAreaView, which only
  // Home had) so every screen gets status-bar/notch clearance consistently.
  const insets = useSafeAreaInsets();
  return <View style={[styles.screen, { paddingTop: insets.top }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
});
