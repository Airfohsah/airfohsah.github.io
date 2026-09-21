import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import { IllustratedScreen, GlowCard, GradientButton } from '../components/illustrated';
import { fonts, darkColors as colors } from '../constants/theme';
import { useGameStore } from '../store/GameStore';
import { useGameSounds } from '../lib/sound';

const TURN_EMOJIS = ['🎮', '🔥', '⚡', '🎯', '🏆', '💥', '🎪', '🎭', '🎨', '🎲'];

export default function TurnScreen() {
  const router = useRouter();
  const { state, beginActiveGame } = useGameStore();
  const sounds = useGameSounds(state.settings.soundEnabled);
  const [countdown, setCountdown] = useState<number | 'GO' | null>(null);
  const scale = useRef(new Animated.Value(1)).current;

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
    <IllustratedScreen>
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
        <GlowCard accent="rgba(245,197,24,0.4)" style={styles.ruleCard}>
          <Text style={styles.ruleLabel}>The Rule</Text>
          <Text style={styles.ruleText}>Describe the word without saying the word!</Text>
        </GlowCard>

        {countdown !== null && (
          <Animated.Text style={[styles.countdown, { transform: [{ scale }] }]}>
            {countdown}
          </Animated.Text>
        )}
      </View>

      {countdown === null && (
        <View style={styles.footer}>
          <GradientButton label="I'm Ready ▶" onPress={beginTurn} />
        </View>
      )}
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  emoji: { fontSize: 48 },
  name: { fontFamily: fonts.brush, fontSize: 34, color: '#f5f2ea' },
  subtitle: { color: '#c7c2e0', fontFamily: fonts.body, fontSize: 15, textAlign: 'center' },
  metaBadge: {
    backgroundColor: 'rgba(8,10,26,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  metaText: { fontFamily: fonts.mono, fontSize: 13, color: colors.accent },
  ruleCard: { padding: 20, maxWidth: 300 },
  ruleLabel: { fontFamily: fonts.mono, fontSize: 11, color: '#c7c2e0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  ruleText: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.accent, lineHeight: 22 },
  countdown: { fontSize: 96, fontFamily: fonts.display, color: colors.accent3 },
  footer: { padding: 24 },
});
