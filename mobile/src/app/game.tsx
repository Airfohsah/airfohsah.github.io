import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { deactivateKeepAwake } from 'expo-keep-awake';
import { DeviceMotion } from 'expo-sensors';
import { Screen } from '../components/ui';
import { fonts, Palette } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';
import { useGameStore } from '../store/GameStore';
import { useGameSounds } from '../lib/sound';

const TILT_THRESHOLD = 35;
const TILT_COOLDOWN_MS = 1200;

export default function GameScreen() {
  const router = useRouter();
  const { state, markGot, markSkip, endActiveGame } = useGameStore();
  const sounds = useGameSounds(state.settings.soundEnabled);
  const [flash, setFlash] = useState<'got' | 'skip' | null>(null);
  const opacity = useRef(new Animated.Value(1)).current;
  const [timerRemaining, setTimerRemaining] = useState(state.timerSeconds);
  const endedRef = useRef(false);
  const { colors, scheme } = useTheme();
  const styles = makeStyles(colors, scheme);

  const active = state.active;
  const catLabel = state.selectedCats.map((k) => state.words[k]?.name).filter(Boolean).join(' + ');

  const finishGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    try {
      // unlockAsync() sets policy to DEFAULT, which in Expo Go doesn't
      // reliably fall back to the app.json "portrait" setting (that's baked
      // into AndroidManifest.xml only in a real prebuilt/standalone build).
      // Lock back to portrait explicitly so this is deterministic everywhere.
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch {}
    try {
      deactivateKeepAwake('watin-be-this-game');
    } catch {}
    await endActiveGame();
    router.replace('/results');
  }, [endActiveGame, router]);

  // words-mode end condition: queue exhausted
  useEffect(() => {
    if (!active) return;
    if (state.roundMode === 'words' && active.index >= active.queue.length) {
      finishGame();
    }
  }, [active, state.roundMode, finishGame]);

  // timer-mode countdown
  useEffect(() => {
    if (state.roundMode !== 'timer') return;
    setTimerRemaining(state.timerSeconds);
    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        const next = prev - 1;
        if (next <= 10 && next > 5) sounds.playTimerTick();
        else if (next <= 5 && next > 0) sounds.playTimerUrgent();
        if (next <= 0) {
          clearInterval(interval);
          sounds.playTimerEnd();
          finishGame();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.roundMode]);

  // tilt-to-skip/got-it
  useEffect(() => {
    if (!state.settings.tiltEnabled) return;
    let baseline: number | null = null;
    let cooldown = false;
    DeviceMotion.setUpdateInterval(100);
    const sub = DeviceMotion.addListener((measurement) => {
      const gamma = measurement.rotation?.gamma ?? 0;
      if (baseline === null) {
        baseline = gamma;
        return;
      }
      if (cooldown) return;
      const delta = gamma - baseline;
      if (delta < -TILT_THRESHOLD) {
        cooldown = true;
        onGot();
        setTimeout(() => (cooldown = false), TILT_COOLDOWN_MS);
      } else if (delta > TILT_THRESHOLD) {
        cooldown = true;
        onSkip();
        setTimeout(() => (cooldown = false), TILT_COOLDOWN_MS);
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.tiltEnabled]);

  const doFlash = (kind: 'got' | 'skip') => {
    setFlash(kind);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setFlash(null), 280);
  };

  const onGot = () => {
    markGot();
    doFlash('got');
  };
  const onSkip = () => {
    markSkip();
    doFlash('skip');
  };

  const onExit = () => {
    Alert.alert('Exit game?', 'Current progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Exit',
        style: 'destructive',
        onPress: async () => {
          endedRef.current = true;
          try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          } catch {}
          try {
            deactivateKeepAwake('watin-be-this-game');
          } catch {}
          router.replace('/');
        },
      },
    ]);
  };

  if (!active) return <Screen />;

  const idx = active.queue.length > 0 ? active.index % active.queue.length : 0;
  const current = active.queue[idx];
  const total = state.roundMode === 'words' ? state.wordCount : active.index;

  return (
    <Screen>
      <View style={styles.layout}>
        <Pressable style={[styles.tapZone, styles.tapSkip]} onPress={onSkip}>
          <Text style={styles.tapLabelSkip}>{'⏭️'}{'\n'}SKIP</Text>
        </Pressable>

        <View style={styles.wordStage}>
          <View style={styles.meta}>
            <Text style={styles.catLabel} numberOfLines={1}>{catLabel || '—'}</Text>
            <Text style={styles.score}>{active.got} / {total}</Text>
          </View>
          <Pressable style={styles.exitBtn} onPress={onExit} hitSlop={8}>
            <Text style={styles.exitBtnText}>{'✕'}</Text>
          </Pressable>

          {state.roundMode === 'timer' && (
            <Text style={[styles.timer, timerRemaining <= 10 && styles.timerUrgent]}>{timerRemaining}s</Text>
          )}

          <Animated.View style={{ opacity }}>
            <Text style={styles.kicker}>Watin Be This?</Text>
            <Text style={styles.wordText}>{current?.word ?? '—'}</Text>
            <Text style={styles.wordCat}>{current?.cat ?? '—'}</Text>
          </Animated.View>
        </View>

        <Pressable style={[styles.tapZone, styles.tapGot]} onPress={onGot}>
          <Text style={styles.tapLabelGot}>{'✅'}{'\n'}GOT IT</Text>
        </Pressable>
      </View>

      {flash && (
        <View style={[StyleSheet.absoluteFill, styles.feedbackOverlay]} pointerEvents="none">
          <Text style={styles.feedbackEmoji}>{flash === 'got' ? '✅' : '⏭️'}</Text>
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette, scheme: 'light' | 'dark') =>
  StyleSheet.create({
    layout: { flex: 1, flexDirection: 'row' },
    tapZone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tapSkip: {
      backgroundColor: scheme === 'light' ? '#ffe4e6' : '#1e0a10',
      borderRightWidth: 2,
      borderColor: scheme === 'light' ? '#ffc2c7' : '#3a1520',
    },
    tapGot: {
      backgroundColor: scheme === 'light' ? '#dcfbee' : '#0a2018',
      borderLeftWidth: 2,
      borderColor: scheme === 'light' ? '#a9f0d1' : '#0e3a28',
    },
    tapLabelSkip: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.accent2, textAlign: 'center', opacity: 0.8, lineHeight: 24 },
    tapLabelGot: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.accent3, textAlign: 'center', opacity: 0.8, lineHeight: 24 },
    wordStage: {
      flex: 2.5,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      borderLeftWidth: 1.5,
      borderRightWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    meta: { position: 'absolute', top: 12, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' },
    catLabel: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted, maxWidth: '60%' },
    score: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
    exitBtn: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: scheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exitBtnText: { color: colors.muted, fontSize: 14 },
    timer: { fontFamily: fonts.mono, fontSize: 24, fontWeight: '900', color: colors.accent, marginBottom: 8, textAlign: 'center' },
    timerUrgent: { color: colors.accent2 },
    kicker: { fontFamily: fonts.mono, fontSize: 11, color: colors.accent, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.8, textAlign: 'center', marginBottom: 10 },
    wordText: { fontFamily: fonts.display, fontSize: 40, color: colors.text, textAlign: 'center', letterSpacing: -1 },
    wordCat: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginTop: 10 },
    feedbackOverlay: { alignItems: 'center', justifyContent: 'center' },
    feedbackEmoji: { fontSize: 80 },
  });
