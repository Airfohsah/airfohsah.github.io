import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IllustratedScreen, GlowCard, GradientButton, OutlineButton } from '../components/illustrated';
import { fonts, darkColors as colors } from '../constants/theme';
import { useGameStore } from '../store/GameStore';

export default function ResultsScreen() {
  const router = useRouter();
  const { state, playAgain } = useGameStore();
  const { resultsMode, lastRoundSummary, lastLog, finalStandings, versusPlayers, currentRound } = state;

  const isFinal = resultsMode === 'final';
  const winner = finalStandings?.[0];

  const subtitle = (() => {
    if (resultsMode === 'final') return winner ? `🏆 ${winner.name} wins!` : '';
    if (resultsMode === 'round-complete') return `Round ${currentRound - 1} done! Starting Round ${currentRound}`;
    return lastRoundSummary
      ? `${lastRoundSummary.playerName ?? ''} got ${lastRoundSummary.got} word${lastRoundSummary.got !== 1 ? 's' : ''}`
      : '';
  })();

  const scoreValue = (() => {
    if (isFinal) {
      if (versusPlayers.length === 1) return `${winner?.totalScore ?? 0} / ${lastRoundSummary?.total ?? 0}`;
      return String(winner?.totalScore ?? 0);
    }
    return String(lastRoundSummary?.got ?? 0);
  })();

  const goNextPlayer = () => router.push('/turn');
  const goNextRound = () => router.push('/turn');
  const goPlayAgain = () => {
    playAgain();
    router.push('/turn');
  };

  return (
    <IllustratedScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isFinal ? 'Game' : 'Round'}</Text>
          <Text style={styles.headerTitleAccent}>Over!</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.scoreBig}>
          <Text style={styles.scoreNum}>{scoreValue}</Text>
          <Text style={styles.scoreLabel}>{isFinal ? 'final score' : 'words got'}</Text>
        </View>

        <GlowCard accent="rgba(255,255,255,0.15)" style={styles.logCard}>
          <Text style={styles.logHeader}>{isFinal ? 'FINAL SCORES' : 'WORD LOG'}</Text>
          <View style={styles.logList}>
            {isFinal
              ? (finalStandings ?? []).map((p, i) => (
                  <View key={p.name + i} style={styles.logItem}>
                    <Text style={styles.logItemWord}>{i === 0 ? '👑 ' : ''}{p.name}</Text>
                    <Text style={styles.logItemGot}>{p.totalScore} pts</Text>
                  </View>
                ))
              : lastLog.map((item, i) => (
                  <View key={item.word + i} style={styles.logItem}>
                    <Text style={styles.logItemWord}>{item.word}</Text>
                    <Text style={item.got ? styles.logItemGot : styles.logItemSkip}>
                      {item.got ? 'Got it' : 'Skipped'}
                    </Text>
                  </View>
                ))}
            {!isFinal && lastLog.length === 0 && (
              <Text style={styles.emptyLog}>No words played this turn.</Text>
            )}
          </View>
        </GlowCard>

        <View style={styles.btns}>
          {resultsMode === 'mid' && <GradientButton label="Next Player →" onPress={goNextPlayer} />}
          {resultsMode === 'round-complete' && <GradientButton label="Next Round →" onPress={goNextRound} />}
          {isFinal && (
            <>
              <GradientButton label="Play Again" onPress={goPlayAgain} />
              <OutlineButton label="Change Category" onPress={() => router.push('/category')} />
              <OutlineButton label="Home" onPress={() => router.push('/')} />
            </>
          )}
        </View>
      </ScrollView>
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  headerTitle: { fontFamily: fonts.brush, fontSize: 30, color: '#f5f2ea', lineHeight: 36 },
  headerTitleAccent: { fontFamily: fonts.brush, fontSize: 36, color: colors.accent, lineHeight: 42, marginTop: -4 },
  headerSubtitle: { color: '#c7c2e0', fontFamily: fonts.mono, fontSize: 13, marginTop: 8, textAlign: 'center' },
  scoreBig: { alignItems: 'center', marginVertical: 20, marginBottom: 28 },
  scoreNum: { fontFamily: fonts.display, fontSize: 72, color: colors.accent3, lineHeight: 78 },
  scoreLabel: { color: '#c7c2e0', fontFamily: fonts.mono, fontSize: 13, marginTop: 4 },
  logCard: { overflow: 'hidden', marginBottom: 20 },
  logHeader: {
    padding: 14,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    fontFamily: fonts.mono,
    fontSize: 13,
    fontWeight: '700',
    color: '#c7c2e0',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logList: { maxHeight: 300 },
  logItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logItemWord: { fontFamily: fonts.body, fontSize: 14, color: '#f5f2ea', flexShrink: 1 },
  logItemGot: { fontFamily: fonts.body, fontSize: 14, color: colors.accent3 },
  logItemSkip: { fontFamily: fonts.body, fontSize: 14, color: colors.accent2 },
  emptyLog: { padding: 20, textAlign: 'center', color: '#c7c2e0', fontFamily: fonts.mono, fontSize: 13 },
  btns: { gap: 12 },
});
