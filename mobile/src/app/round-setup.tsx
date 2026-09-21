import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IllustratedScreen, IllustratedHeader, GlowStepper, GradientButton } from '../components/illustrated';
import { fonts } from '../constants/theme';
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

  const start = () => {
    if (state.playMode === 'solo') startSolo();
    else startVersus();
    router.push('/turn');
  };

  return (
    <IllustratedScreen>
      <IllustratedHeader title="Round" subtitle="setup" onBack={() => router.push('/category')} />
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
          <GlowStepper
            label="Words per turn"
            value={state.wordCount}
            onDecrement={() => changeWordCount(-5)}
            onIncrement={() => changeWordCount(5)}
          />
        ) : (
          <GlowStepper
            label="Time per turn"
            value={state.timerSeconds}
            onDecrement={() => changeTimerSeconds(-30)}
            onIncrement={() => changeTimerSeconds(30)}
            format={formatTimer}
          />
        )}

        {state.playMode === 'versus' && (
          <GlowStepper
            label="Number of rounds"
            value={state.totalRounds}
            onDecrement={() => changeTotalRounds(-1)}
            onIncrement={() => changeTotalRounds(1)}
          />
        )}

        <GradientButton label="▶  Start Game" onPress={start} style={{ marginTop: 8 }} />
      </View>
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 20, gap: 20, justifyContent: 'center' },
  hint: { color: '#c7c2e0', fontFamily: fonts.mono, fontSize: 13 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(8,10,26,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
  },
  toggleBtnActive: { borderColor: '#f5c518', backgroundColor: 'rgba(245,197,24,0.12)' },
  toggleText: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#f5f2ea' },
  toggleTextActive: { color: '#f5c518' },
});
