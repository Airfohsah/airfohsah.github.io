import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenHeader, Screen } from '../components/ui';
import { fonts, Palette, radius } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';

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
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Screen>
      <ScreenHeader title="How to Play" />
      <ScrollView contentContainerStyle={styles.list}>
        {ITEMS.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    list: { padding: 20, paddingTop: 0, gap: 16, paddingBottom: 40 },
    card: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'flex-start',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.xl,
      padding: 16,
    },
    icon: { fontSize: 28 },
    cardBody: { flex: 1, gap: 4 },
    cardTitle: { fontFamily: fonts.displaySemi, fontSize: 15, color: colors.text },
    cardText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 19 },
  });
