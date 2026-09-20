import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenHeader, Screen } from '../components/ui';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { useGameStore } from '../store/GameStore';

export default function ModeSelectScreen() {
  const router = useRouter();
  const { pickMode } = useGameStore();

  const choose = (mode: 'solo' | 'versus') => {
    pickMode(mode);
    if (mode === 'solo') router.push('/category');
    else router.push('/players');
  };

  return (
    <Screen>
      <ScreenHeader title="How are you playing?" onBack={() => router.back()} />
      <View style={styles.body}>
        <Pressable style={styles.card} onPress={() => choose('solo')}>
          <Text style={styles.emoji}>{'👤'}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Solo</Text>
            <Text style={styles.cardDesc}>
              One person holds the phone. Everyone else gives clues. Race against words or the clock.
            </Text>
          </View>
        </Pressable>
        <Pressable style={styles.card} onPress={() => choose('versus')}>
          <Text style={styles.emoji}>{'⚔️'}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Versus</Text>
            <Text style={styles.cardDesc}>
              2 to 10 players take turns. Name your players or teams. Highest score wins.
            </Text>
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', padding: 20, gap: 16 },
  card: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xxl + 2,
    padding: 24,
  },
  emoji: { fontSize: 36 },
  cardText: { flex: 1, gap: 6 },
  cardTitle: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.text },
  cardDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 19 },
});
