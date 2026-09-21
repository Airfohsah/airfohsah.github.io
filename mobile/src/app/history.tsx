import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IllustratedScreen, IllustratedHeader, GlowCard, OutlineButton } from '../components/illustrated';
import { fonts } from '../constants/theme';
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
    <IllustratedScreen>
      <IllustratedHeader title="Leader" subtitle="board" />
      <ScrollView contentContainerStyle={styles.content}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>No games yet. Play one first!</Text>
        ) : (
          entries.map((game, gi) => {
            const maxScore = Math.max(...game.players.map((p) => p.score));
            return (
              <GlowCard key={gi} accent="rgba(255,255,255,0.15)" style={styles.card}>
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
              </GlowCard>
            );
          })
        )}
      </ScrollView>
      {entries.length > 0 && (
        <View style={styles.footer}>
          <OutlineButton label="Clear History" accent="rgba(255,82,82,0.5)" small onPress={onClear} />
        </View>
      )}
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 24, gap: 16, paddingBottom: 20 },
  empty: { textAlign: 'center', color: '#c7c2e0', fontFamily: fonts.mono, fontSize: 13, padding: 40 },
  card: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#f5f2ea' },
  cardDate: { fontFamily: fonts.mono, fontSize: 11, color: '#8b86ad' },
  cardCats: { fontFamily: fonts.mono, fontSize: 11, color: '#8b86ad', marginBottom: 10 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  playerName: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#f5f2ea' },
  playerScore: { fontFamily: fonts.mono, fontSize: 14, color: '#f5c518' },
  footer: { padding: 20, paddingTop: 4 },
});
