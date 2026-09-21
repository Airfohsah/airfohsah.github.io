import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IllustratedScreen, IllustratedHeader, GlowCard, GlowStepper, GradientButton } from '../components/illustrated';
import { fonts } from '../constants/theme';
import { useGameStore } from '../store/GameStore';

export default function PlayersScreen() {
  const router = useRouter();
  const { state, setPlayerCount, setPlayerName, confirmPlayerNames } = useGameStore();

  const next = () => {
    confirmPlayerNames();
    router.push('/category');
  };

  return (
    <IllustratedScreen>
      <IllustratedHeader title="Who's" subtitle="playing?" onBack={() => router.push('/mode-select')} />
      <View style={styles.body}>
        <GlowStepper
          label="Players"
          value={state.playerCount}
          onDecrement={() => setPlayerCount(state.playerCount - 1)}
          onIncrement={() => setPlayerCount(state.playerCount + 1)}
        />
        <View style={styles.fields}>
          {state.playerNames.slice(0, state.playerCount).map((name, i) => (
            <GlowCard key={i} accent="rgba(255,255,255,0.15)" style={styles.field}>
              <Text style={styles.fieldLabel}>P{i + 1}</Text>
              <TextInput
                value={name}
                onChangeText={(t) => setPlayerName(i, t)}
                placeholder="Enter name..."
                placeholderTextColor="#8b86ad"
                maxLength={20}
                style={styles.input}
              />
            </GlowCard>
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <GradientButton label="Next →" onPress={next} />
      </View>
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 20, gap: 16 },
  fields: { gap: 12 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  fieldLabel: { fontFamily: fonts.displaySemi, fontSize: 13, color: '#c7c2e0', minWidth: 28 },
  input: {
    flex: 1,
    color: '#f5f2ea',
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  footer: { padding: 20, paddingBottom: 24 },
});
