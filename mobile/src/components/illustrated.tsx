import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { HomeBackground } from './HomeBackground';
import { darkColors as colors, fonts, radius } from '../constants/theme';

// Shared "illustrated" design language — the dusk mountain backdrop, brush
// titles, glowing bordered cards, gradient CTA pills — used across the
// whole app now, not just Home/Mode Select. Always pinned to the fixed
// dark palette (it's the app's branded look, same reasoning as the
// background art itself not flipping with light/dark mode).

export function IllustratedScreen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.screen, style]}>
      <HomeBackground />
      {children}
    </View>
  );
}

export function IllustratedHeader({
  title,
  subtitle,
  onBack,
  showSettings,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showSettings?: boolean;
}) {
  const router = useRouter();
  return (
    <View style={styles.headerWrap}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack ?? (() => router.back())} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        {showSettings && (
          <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn} hitSlop={10}>
            <Text style={styles.settingsIcon}>{'⚙️'}</Text>
          </Pressable>
        )}
      </View>
      {title && (
        <View style={styles.titleWrap}>
          <Text style={styles.titleTop}>{title}</Text>
          {subtitle && (
            <View>
              <Text style={styles.titleBottom}>{subtitle}</Text>
              <View style={styles.titleUnderline} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function GlowCard({
  accent,
  selected,
  onPress,
  style,
  children,
}: {
  accent: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const Wrap = onPress ? Pressable : View;
  return (
    <Wrap
      onPress={onPress}
      style={[
        styles.glowCard,
        { borderColor: accent, shadowColor: accent, shadowOpacity: selected ? 0.75 : 0.4 },
        selected && { backgroundColor: 'rgba(255,255,255,0.06)' },
        style,
      ]}
    >
      {children}
    </Wrap>
  );
}

export function GradientButton({
  label,
  onPress,
  disabled,
  small,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.gradientBtnWrap, disabled && { opacity: 0.5 }, style]}>
      <LinearGradient
        colors={['#ffd23f', '#ff9c27']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientBtn, small && styles.gradientBtnSmall]}
      >
        <Text style={[styles.gradientBtnLabel, small && styles.gradientBtnLabelSmall]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GlowStepper({
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
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
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

export function OutlineButton({
  label,
  accent,
  onPress,
  small,
  disabled,
  style,
}: {
  label: string;
  accent?: string;
  onPress: () => void;
  small?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = accent ?? 'rgba(255,255,255,0.25)';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.outlineBtn,
        small && styles.outlineBtnSmall,
        { borderColor: c },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.outlineBtnLabel, small && styles.outlineBtnLabelSmall]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { paddingHorizontal: 20, paddingTop: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(10,8,30,0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: colors.text, fontSize: 18 },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 20 },
  titleWrap: { marginTop: 20 },
  titleTop: { fontFamily: fonts.brush, fontSize: 32, color: '#f5f2ea', lineHeight: 38 },
  titleBottom: { fontFamily: fonts.brush, fontSize: 38, color: colors.accent, lineHeight: 44, marginTop: -2 },
  titleUnderline: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff9c27',
    width: '50%',
    marginTop: 2,
    transform: [{ rotate: '-1.5deg' }],
  },

  glowCard: {
    backgroundColor: 'rgba(8,10,26,0.72)',
    borderWidth: 2,
    borderRadius: radius.xxl,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  gradientBtnWrap: {
    borderRadius: 999,
    shadowColor: '#ff9c27',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  gradientBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 999,
  },
  gradientBtnSmall: { paddingVertical: 12 },
  gradientBtnLabel: { fontFamily: fonts.displayBold, fontSize: 17, color: '#1a1200' },
  gradientBtnLabelSmall: { fontSize: 14 },

  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: 'rgba(8,10,26,0.55)',
  },
  outlineBtnSmall: { paddingVertical: 11 },
  outlineBtnLabel: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.text },
  outlineBtnLabelSmall: { fontSize: 13 },

  stepperRow: {
    backgroundColor: 'rgba(8,10,26,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperLabel: { fontSize: 14, color: '#c7c2e0', fontFamily: fonts.body },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: colors.text, fontSize: 18, lineHeight: 20 },
  stepVal: { fontSize: 16, fontFamily: fonts.displaySemi, color: colors.text, minWidth: 40, textAlign: 'center' },
});
