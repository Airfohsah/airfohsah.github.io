import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { Button, Screen } from '../components/ui';
import { fonts, Palette, radius } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';
import { useGameStore } from '../store/GameStore';
import { useGameSounds } from '../lib/sound';

const TURN_EMOJIS = ['🎮', '🔥', '⚡', '🎯', '🏆', '💥', '🎪', '🎭', '🎨', '🎲'];

export default function TurnScreen() {
  const router = useRouter();
  const { state, beginActiveGame } = useGameStore();
  const sounds = useGameSounds(state.settings.soundEnabled);
  const [countdown, setCountdown] = useState<number | 'GO' | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const { colors, scheme } = useTheme();
  const styles = makeStyles(colors, scheme);

  const player = state.versusPlayers[state.versusCurrentIdx];
  const emoji = TURN_EMOJIS[state.versusCurrentIdx % TURN_EMOJIS.length];
  const isSolo = state.versusPlayers.length === 1;
  const modeText =
    state.roundMode === 'timer' ? `${state.timerSeconds}s on the clock` : `${state.wordCount} words to go`;
  const roundText = state.totalRounds > 1 ? `Round ${state.currentRound} of ${state.totalRounds}` : `Round ${state.currentRound}`;

  const pulse = () => {
    scale.setValue(1.3);
    Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const beginTurn = () => {
    let count = 3;
    setCountdown(count);
    sounds.playCountdownTick(count);
    pulse();
    const tick = setInterval(() => {
      count -= 1;
      pulse();
      if (count > 0) {
        setCountdown(count);
        sounds.playCountdownTick(count);
      } else {
        clearInterval(tick);
        setCountdown('GO');
        sounds.playGo();
        setTimeout(async () => {
          beginActiveGame();
          try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          } catch {
            // orientation lock unsupported — game screen still works in whatever orientation
          }
          try {
            await activateKeepAwakeAsync('watin-be-this-game');
          } catch {}
          setCountdown(null);
          router.replace('/game');
        }, 600);
      }
    }, 1000);
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.name}>{player?.name ?? 'Player'}</Text>
        <Text style={styles.subtitle}>
          {isSolo ? 'Hold the phone up so everyone can see!' : 'Your turn! Hold the phone and get ready.'}
        </Text>
        <View style={styles.metaBadge}>
          <Text style={styles.metaText}>
            {roundText} {'·'} {modeText}
          </Text>
        </View>
        <View style={styles.ruleCard}>
          <Text style={styles.ruleLabel}>The Rule</Text>
          <Text style={styles.ruleText}>Describe the word without saying the word!</Text>
        </View>

        {countdown !== null && (
          <Animated.Text style={[styles.countdown, { transform: [{ scale }] }]}>
            {countdown}
          </Animated.Text>
        )}
      </View>

      {countdown === null && (
        <View style={styles.footer}>
          <Button label="I'm Ready ▶" onPress={beginTurn} />
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette, scheme: 'light' | 'dark') =>
  StyleSheet.create({
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
    emoji: { fontSize: 48 },
    name: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
    subtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, textAlign: 'center' },
    metaBadge: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    metaText: { fontFamily: fonts.mono, fontSize: 13, color: colors.accent },
    ruleCard: {
      backgroundColor: scheme === 'light' ? '#fff6d9' : '#1a1800',
      borderWidth: 1.5,
      borderColor: 'rgba(245,197,24,0.35)',
      borderRadius: radius.xl,
      padding: 20,
      maxWidth: 300,
    },
    ruleLabel: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
    ruleText: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.accent, lineHeight: 22 },
    countdown: { fontSize: 96, fontFamily: fonts.display, color: colors.accent3 },
    footer: { padding: 24 },
  });
