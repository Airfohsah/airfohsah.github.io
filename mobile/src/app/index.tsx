import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Screen } from '../components/ui';
import { colors, fonts, spacing } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <LinearGradient
        colors={['#1a2540', colors.bg]}
        start={{ x: 0.15, y: 0.4 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn} hitSlop={10}>
          <Text style={styles.settingsIcon}>{'⚙️'}</Text>
        </Pressable>

        <View style={styles.center}>
          <View style={styles.logo}>
            <Text style={styles.title}>Watin Be This?</Text>
            <Text style={styles.tagline}>// naija charades, next level //</Text>
          </View>

          <View style={styles.btns}>
            <Button label="▶  Play" onPress={() => router.push('/mode-select')} />
            <Button label="?  How to Play" variant="secondary" onPress={() => router.push('/how-to-play')} />
            <Button label="🏆  Leaderboard" variant="secondary" onPress={() => router.push('/history')} />
          </View>

          <Text style={styles.footnote}>
            Landscape mode {'·'} tap right = got it {'·'} tap left = skip{'\n'}
            <Text style={styles.footnoteStrong}>Rules: Describe the words without saying the word</Text>
          </Text>
        </View>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  settingsBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  settingsIcon: { fontSize: 20 },
  center: { alignItems: 'center', gap: 32, paddingHorizontal: 24, width: '100%', maxWidth: 360 },
  logo: { alignItems: 'center' },
  title: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.accent,
    letterSpacing: -2,
    textAlign: 'center',
  },
  tagline: { fontFamily: fonts.mono, color: colors.muted, fontSize: 14, marginTop: 6 },
  btns: { width: '100%', gap: spacing.md },
  footnote: {
    textAlign: 'center',
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 18,
  },
  footnoteStrong: { color: colors.text, fontSize: 12 },
});
