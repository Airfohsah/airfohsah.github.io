import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { HomeBackground } from '../components/HomeBackground';
// Home keeps its own fixed dusk-illustration look regardless of the app's
// light/dark setting — it's branded artwork (like the icon), not a plain
// themeable background, and its text colors are tuned specifically for
// contrast against that illustration.
import { darkColors as colors, fonts } from '../constants/theme';

function MenuRow({
  icon,
  iconBg,
  iconColor,
  label,
  accentColor,
  onPress,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.menuRow, { borderColor: accentColor }]}>
      <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
        <Text style={[styles.menuIconText, { color: iconColor }]}>{icon}</Text>
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={22} color={accentColor} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <HomeBackground />

      <View style={styles.safe}>
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn} hitSlop={10}>
          <Text style={styles.settingsIcon}>{'⚙️'}</Text>
        </Pressable>

        <View style={styles.center}>
          <View style={styles.logo}>
            <View style={styles.titleWrap}>
              <Text style={styles.sparkleLeft}>{'✱'}</Text>
              <View>
                <Text style={styles.titleTop}>Watin Be</Text>
                <Text style={styles.titleBottom}>THIS?</Text>
                <View style={styles.underline} />
              </View>
              <Text style={styles.sparkleRight}>{'✱'}</Text>
            </View>
            <Text style={styles.tagline}>// naija charades, next level //</Text>
          </View>

          <View style={styles.btns}>
            <Pressable onPress={() => router.push('/mode-select')} style={styles.playBtnWrap}>
              <LinearGradient
                colors={['#ffd23f', '#ff9c27']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playBtn}
              >
                <Text style={styles.playIcon}>{'▶'}</Text>
                <Text style={styles.playLabel}>Play</Text>
              </LinearGradient>
            </Pressable>

            <MenuRow
              icon="?"
              iconBg="#3a5cff"
              iconColor="#ffffff"
              label="How to Play"
              accentColor="#3a5cff"
              onPress={() => router.push('/how-to-play')}
            />
            <MenuRow
              icon={'🏆'}
              iconBg="#7a4bd6"
              iconColor="#ffffff"
              label="Leaderboard"
              accentColor="#7a4bd6"
              onPress={() => router.push('/history')}
            />
          </View>

          <Text style={styles.footnote}>
            LANDSCAPE MODE {'·'} TAP RIGHT = GOT IT {'·'} TAP LEFT = SKIP
          </Text>
          <Text style={styles.footnote2}>
            <Text style={styles.footnoteRules}>Rules: </Text>
            Describe the words without saying the word
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  settingsBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  settingsIcon: { fontSize: 22 },
  center: { alignItems: 'center', gap: 28, paddingHorizontal: 24, width: '100%', maxWidth: 380 },
  logo: { alignItems: 'center' },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sparkleLeft: { color: colors.accent, fontSize: 20, marginBottom: 40, transform: [{ rotate: '-15deg' }] },
  sparkleRight: { color: '#fff', fontSize: 16, marginTop: 30, transform: [{ rotate: '20deg' }] },
  titleTop: {
    fontFamily: fonts.brush,
    fontSize: 46,
    color: '#f5f2ea',
    textAlign: 'center',
    lineHeight: 50,
  },
  titleBottom: {
    fontFamily: fonts.brush,
    fontSize: 56,
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 58,
    marginTop: -6,
  },
  underline: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ff9c27',
    width: '72%',
    alignSelf: 'center',
    marginTop: 2,
    transform: [{ rotate: '-2deg' }],
  },
  tagline: { fontFamily: fonts.mono, color: '#c7c2e0', fontSize: 14, marginTop: 14 },
  btns: { width: '100%', gap: 14 },
  playBtnWrap: {
    borderRadius: 999,
    shadowColor: '#ff9c27',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 999,
  },
  playIcon: { fontSize: 18, color: '#1a1200' },
  playLabel: { fontFamily: fonts.displayBold, fontSize: 19, color: '#1a1200' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: 'rgba(10,8,30,0.55)',
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconText: { fontSize: 16, fontFamily: fonts.displayBold },
  menuLabel: { flex: 1, fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text },
  footnote: {
    textAlign: 'center',
    color: '#9d97c2',
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 8,
  },
  footnote2: {
    textAlign: 'center',
    color: '#c7c2e0',
    fontFamily: fonts.mono,
    fontSize: 12,
    marginTop: 4,
  },
  footnoteRules: { color: colors.accent, fontFamily: fonts.monoMedium },
});
