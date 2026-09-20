import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Button, ScreenHeader, Screen } from '../components/ui';
import { colors, fonts, radius } from '../constants/theme';
import { clearHistory, getHistory } from '../lib/storage';
import { HistoryEntry } from '../types';

export default function HistoryScreen() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setEntries);
    }, [])
  );

  const onClear = () => {
    Alert.alert('Clear all game history?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setEntries([]);
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader title="Leaderboard" />
      <ScrollView contentContainerStyle={styles.content}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>No games yet. Play one first!</Text>
        ) : (
          entries.map((game, gi) => {
            const maxScore = Math.max(...game.players.map((p) => p.score));
            return (
              <View key={gi} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Game {entries.length - gi}</Text>
                  <Text style={styles.cardDate}>{game.date}</Text>
                </View>
                <Text style={styles.cardCats}>{game.categories.join(' + ')}</Text>
                {[...game.players]
                  .sort((a, b) => b.score - a.score)
                  .map((p, pi) => (
                    <View key={pi} style={styles.playerRow}>
                      <Text style={styles.playerName}>
                        {p.name} {p.score === maxScore ? '👑' : ''}
                      </Text>
                      <Text style={styles.playerScore}>{p.score} pts</Text>
                    </View>
                  ))}
              </View>
            );
          })
        )}
      </ScrollView>
      {entries.length > 0 && (
        <View style={styles.footer}>
          <Button label="Clear History" variant="danger" small onPress={onClear} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 20 },
  empty: { textAlign: 'center', color: colors.muted, fontFamily: fonts.mono, fontSize: 13, padding: 40 },
  card: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.xl, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  cardDate: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
  cardCats: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted, marginBottom: 10 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderColor: colors.border },
  playerName: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  playerScore: { fontFamily: fonts.mono, fontSize: 14, color: colors.accent },
  footer: { padding: 20, paddingTop: 4 },
});
