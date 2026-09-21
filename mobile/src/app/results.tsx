import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Screen } from '../components/ui';
import { fonts, Palette, radius } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';
import { useGameStore } from '../store/GameStore';

export default function ResultsScreen() {
  const router = useRouter();
  const { state, playAgain } = useGameStore();
  const { resultsMode, lastRoundSummary, lastLog, finalStandings, versusPlayers, currentRound } = state;
  const { colors, scheme } = useTheme();
  const styles = makeStyles(colors);

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
    <Screen>
      <LinearGradient
        colors={scheme === 'light' ? ['#fff3d6', colors.bg] : ['#1a2010', colors.bg]}
        start={{ x: 0.8, y: 0.1 }}
        end={{ x: 0.2, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Round Over!</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.scoreBig}>
          <Text style={styles.scoreNum}>{scoreValue}</Text>
          <Text style={styles.scoreLabel}>{isFinal ? 'final score' : 'words got'}</Text>
        </View>

        <View style={styles.logCard}>
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
        </View>

        <View style={styles.btns}>
          {resultsMode === 'mid' && <Button label="Next Player →" onPress={goNextPlayer} />}
          {resultsMode === 'round-complete' && <Button label="Next Round →" onPress={goNextRound} />}
          {isFinal && (
            <>
              <Button label="Play Again" onPress={goPlayAgain} />
              <Button label="Change Category" variant="secondary" onPress={() => router.push('/category')} />
              <Button label="Home" variant="secondary" onPress={() => router.push('/')} />
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    content: { padding: 20, paddingTop: 16, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 28 },
    headerTitle: { fontFamily: fonts.display, fontSize: 30, color: colors.text },
    headerSubtitle: { color: colors.muted, fontFamily: fonts.mono, fontSize: 13, marginTop: 6, textAlign: 'center' },
    scoreBig: { alignItems: 'center', marginVertical: 20, marginBottom: 28 },
    scoreNum: { fontFamily: fonts.display, fontSize: 72, color: colors.accent3, lineHeight: 78 },
    scoreLabel: { color: colors.muted, fontFamily: fonts.mono, fontSize: 13, marginTop: 4 },
    logCard: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.xxl, overflow: 'hidden', marginBottom: 20 },
    logHeader: {
      padding: 14,
      borderBottomWidth: 1.5,
      borderColor: colors.border,
      fontFamily: fonts.mono,
      fontSize: 13,
      fontWeight: '700',
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    logList: { maxHeight: 300 },
    logItem: {
      padding: 14,
      borderBottomWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logItemWord: { fontFamily: fonts.body, fontSize: 14, color: colors.text, flexShrink: 1 },
    logItemGot: { fontFamily: fonts.body, fontSize: 14, color: colors.accent3 },
    logItemSkip: { fontFamily: fonts.body, fontSize: 14, color: colors.accent2 },
    emptyLog: { padding: 20, textAlign: 'center', color: colors.muted, fontFamily: fonts.mono, fontSize: 13 },
    btns: { gap: 12 },
  });
