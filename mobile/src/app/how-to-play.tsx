import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { IllustratedScreen, IllustratedHeader, GlowCard } from '../components/illustrated';
import { fonts } from '../constants/theme';

const ACCENTS = ['#3a7dff', '#00c98a', '#ff5252', '#3a7dff', '#a24bff', '#ff9c27', '#00c9c9'];

const ITEMS: { icon: string; title: string; body: string }[] = [
  { icon: '📱', title: 'Landscape Mode', body: "When the game starts it rotates to landscape. Hold the phone up so the crowd can see the word." },
  { icon: '✅', title: 'Got It', body: 'Your team guessed it? Tap the right side of the screen.' },
  { icon: '⏭️', title: 'Skip', body: "Too hard? Tap the left side. Skipped words don't count." },
  { icon: '👤', title: 'Solo Mode', body: 'One player holds the phone, everyone else gives clues. Race against words or the clock.' },
  { icon: '⚔️', title: 'Versus Mode', body: '2 to 10 players take turns. Each holds the phone for their turn. Highest score wins. Saved to leaderboard.' },
  { icon: '⏱️', title: 'Timer Mode', body: 'Race against the clock instead of fixed word count. Set from 30 seconds to 3 minutes.' },
  { icon: '🔄', title: 'Rounds', body: 'In Versus mode choose how many rounds. Most points across all rounds wins.' },
];

export default function HowToPlayScreen() {
  return (
    <IllustratedScreen>
      <IllustratedHeader title="How to" subtitle="play?" />
      <ScrollView contentContainerStyle={styles.list}>
        {ITEMS.map((item, i) => (
          <GlowCard key={item.title} accent={ACCENTS[i % ACCENTS.length]} style={styles.card}>
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.body}</Text>
            </View>
          </GlowCard>
        ))}
      </ScrollView>
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, paddingTop: 24, gap: 14, paddingBottom: 40 },
  card: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', padding: 16 },
  icon: { fontSize: 26 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: '#f5f2ea' },
  cardText: { fontFamily: fonts.body, fontSize: 13, color: '#c7c2e0', lineHeight: 19 },
});
