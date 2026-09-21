import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenHeader, Screen, Stepper } from '../components/ui';
import { fonts, Palette, radius } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';
import { useGameStore } from '../store/GameStore';

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  return `${s}s`;
}

export default function RoundSetupScreen() {
  const router = useRouter();
  const {
    state,
    setRoundMode,
    changeWordCount,
    changeTimerSeconds,
    changeTotalRounds,
    startSolo,
    startVersus,
  } = useGameStore();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const start = () => {
    if (state.playMode === 'solo') startSolo();
    else startVersus();
    router.push('/turn');
  };

  return (
    <Screen>
      <ScreenHeader title="Round Setup" onBack={() => router.push('/category')} />
      <View style={styles.body}>
        <Text style={styles.hint}>Choose how the round is timed:</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, state.roundMode === 'words' && styles.toggleBtnActive]}
            onPress={() => setRoundMode('words')}
          >
            <Text style={[styles.toggleText, state.roundMode === 'words' && styles.toggleTextActive]}>
              {'📝'} Words
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, state.roundMode === 'timer' && styles.toggleBtnActive]}
            onPress={() => setRoundMode('timer')}
          >
            <Text style={[styles.toggleText, state.roundMode === 'timer' && styles.toggleTextActive]}>
              {'⏱️'} Timer
            </Text>
          </Pressable>
        </View>

        {state.roundMode === 'words' ? (
          <Stepper
            label="Words per turn"
            value={state.wordCount}
            onDecrement={() => changeWordCount(-5)}
            onIncrement={() => changeWordCount(5)}
          />
        ) : (
          <Stepper
            label="Time per turn"
            value={state.timerSeconds}
            onDecrement={() => changeTimerSeconds(-30)}
            onIncrement={() => changeTimerSeconds(30)}
            format={formatTimer}
          />
        )}

        {state.playMode === 'versus' && (
          <Stepper
            label="Number of rounds"
            value={state.totalRounds}
            onDecrement={() => changeTotalRounds(-1)}
            onIncrement={() => changeTotalRounds(1)}
          />
        )}

        <Button label="▶  Start Game" onPress={start} />
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    body: { flex: 1, padding: 20, gap: 20, justifyContent: 'center' },
    hint: { color: colors.muted, fontFamily: fonts.mono, fontSize: 13 },
    toggleRow: { flexDirection: 'row', gap: 10 },
    toggleBtn: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },
    toggleBtnActive: { borderColor: colors.accent, backgroundColor: 'rgba(245,197,24,0.08)' },
    toggleText: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
    toggleTextActive: { color: colors.accent },
  });
