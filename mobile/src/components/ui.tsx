import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, Palette, radius, spacing } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

export function Button({
  label,
  onPress,
  variant = 'primary',
  small = false,
  disabled = false,
  loading = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  small?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const variantStyles = makeVariantStyles(colors);
  const variantTextStyles = makeVariantTextStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btnBase,
        variantStyles[variant],
        small && styles.btnSmall,
        (disabled || loading) && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.text} />
      ) : (
        <Text style={[styles.btnLabel, small && styles.btnLabelSmall, variantTextStyles[variant]]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  onBack,
}: {
  title?: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        style={styles.backBtn}
        hitSlop={8}
      >
        <Text style={styles.backBtnText}>{'←'}</Text>
      </Pressable>
      {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
    </View>
  );
}

export function Stepper({
  label,
  value,
  onDecrement,
  onIncrement,
  format,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  format?: (n: number) => string;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.roundConfig}>
      <Text style={styles.roundConfigLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable onPress={onDecrement} style={styles.stepBtn} hitSlop={6}>
          <Text style={styles.stepBtnText}>{'−'}</Text>
        </Pressable>
        <Text style={styles.stepVal}>{format ? format(value) : String(value)}</Text>
        <Pressable onPress={onIncrement} style={styles.stepBtn} hitSlop={6}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

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

export function Toast({ message }: { message: string | null }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  if (!message) return null;
  return (
    <View style={styles.toast} pointerEvents="none">
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

export function Screen({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  // Applied centrally here (rather than per-screen SafeAreaView, which only
  // Home had) so every screen gets status-bar/notch clearance consistently.
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <View style={[styles.screen, { paddingTop: insets.top }, style]}>{children}</View>;
}

const makeVariantStyles = (colors: Palette): Record<ButtonVariant, ViewStyle> =>
  StyleSheet.create({
    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.card2, borderWidth: 1.5, borderColor: colors.border },
    danger: { backgroundColor: '#2a1015', borderWidth: 1.5, borderColor: '#3a1520' },
    success: { backgroundColor: '#0a2a1e', borderWidth: 1.5, borderColor: '#0e3a28' },
  });

const makeVariantTextStyles = (colors: Palette) =>
  StyleSheet.create({
    primary: { color: colors.bg },
    secondary: { color: colors.text },
    danger: { color: colors.accent2 },
    success: { color: colors.accent3 },
  });

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    btnBase: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: radius.xl,
    },
    btnSmall: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.md },
    btnPressed: { opacity: 0.75 },
    btnDisabled: { opacity: 0.5 },
    btnLabel: { fontFamily: fonts.displaySemi, fontSize: 16 },
    btnLabelSmall: { fontSize: 13 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 8,
      marginBottom: 24,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.card2,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backBtnText: { color: colors.text, fontSize: 18 },
    headerTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text },

    roundConfig: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.xl,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    roundConfigLabel: { fontSize: 14, color: colors.muted, fontFamily: fonts.body },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: colors.card2,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: { color: colors.text, fontSize: 18, lineHeight: 20 },
    stepVal: { fontSize: 16, fontFamily: fonts.displaySemi, color: colors.text, minWidth: 40, textAlign: 'center' },

    toast: {
      position: 'absolute',
      bottom: 30,
      left: 24,
      right: 24,
      alignItems: 'center',
    },
    toastText: {
      backgroundColor: colors.card2,
      borderWidth: 1.5,
      borderColor: colors.border,
      color: colors.text,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: radius.lg,
      fontFamily: fonts.mono,
      fontSize: 13,
      overflow: 'hidden',
    },
  });
