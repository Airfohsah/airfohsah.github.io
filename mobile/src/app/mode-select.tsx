import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/ui';
import { HomeBackground } from '../components/HomeBackground';
// Same fixed dusk-illustration treatment as Home — this screen shares that
// branded look, so it's pinned to the dark palette too, not theme-dynamic.
import { darkColors as colors, fonts } from '../constants/theme';
import { useGameStore } from '../store/GameStore';

function ModeCard({
  icon,
  accent,
  title,
  desc,
  onPress,
}: {
  icon: string;
  accent: string;
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { borderColor: accent, shadowColor: accent }]}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <View style={[styles.cardUnderline, { backgroundColor: accent }]} />
      </View>
      <View style={[styles.chevronCircle, { borderColor: accent }]}>
        <Text style={[styles.chevron, { color: accent }]}>{'›'}</Text>
      </View>
    </Pressable>
  );
}

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
      <HomeBackground />
      <View style={styles.safe}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backIcon}>{'←'}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn} hitSlop={10}>
            <Text style={styles.settingsIcon}>{'⚙️'}</Text>
          </Pressable>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.titleTop}>How are you</Text>
          <View>
            <Text style={styles.titleBottom}>playing?</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        <View style={styles.cards}>
          <ModeCard
            icon={'👤'}
            accent="#3a7dff"
            title="Solo"
            desc="One person holds the phone. Everyone else gives clues. Race against words or the clock."
            onPress={() => choose('solo')}
          />
          <ModeCard
            icon={'⚔️'}
            accent="#a24bff"
            title="Versus"
            desc="2 to 10 players take turns. Name your players or teams. Highest score wins."
            onPress={() => choose('versus')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(10,8,30,0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: colors.text, fontSize: 18 },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 20 },
  titleWrap: { marginTop: 24, marginBottom: 28 },
  titleTop: { fontFamily: fonts.brush, fontSize: 36, color: '#f5f2ea', lineHeight: 42 },
  titleBottom: { fontFamily: fonts.brush, fontSize: 44, color: colors.accent, lineHeight: 50, marginTop: -4 },
  titleUnderline: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff9c27',
    width: '55%',
    marginTop: 2,
    transform: [{ rotate: '-1.5deg' }],
  },
  cards: { gap: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(8,10,26,0.72)',
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cardIcon: { fontSize: 34 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: fonts.brush, fontSize: 26 },
  cardDesc: { fontFamily: fonts.body, fontSize: 13, color: '#c7c2e0', lineHeight: 19 },
  cardUnderline: { height: 3, borderRadius: 2, width: 36, marginTop: 4, opacity: 0.8 },
  chevronCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 22, fontFamily: fonts.displayBold },
});
