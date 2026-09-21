import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenHeader, Screen, Stepper } from '../components/ui';
import { fonts, Palette, radius } from '../constants/theme';
import { useTheme } from '../store/ThemeContext';
import { useGameStore } from '../store/GameStore';

export default function PlayersScreen() {
  const router = useRouter();
  const { state, setPlayerCount, setPlayerName, confirmPlayerNames } = useGameStore();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const next = () => {
    confirmPlayerNames();
    router.push('/category');
  };

  return (
    <Screen>
      <ScreenHeader onBack={() => router.push('/mode-select')} />
      <View style={styles.intro}>
        <Text style={styles.hint}>How many players / teams?</Text>
        <Stepper
          label="Players"
          value={state.playerCount}
          onDecrement={() => setPlayerCount(state.playerCount - 1)}
          onIncrement={() => setPlayerCount(state.playerCount + 1)}
        />
      </View>
      <View style={styles.fields}>
        {state.playerNames.slice(0, state.playerCount).map((name, i) => (
          <View key={i} style={styles.field}>
            <Text style={styles.fieldLabel}>Player {i + 1}</Text>
            <TextInput
              value={name}
              onChangeText={(t) => setPlayerName(i, t)}
              placeholder="Enter name..."
              placeholderTextColor={colors.muted}
              maxLength={20}
              style={styles.input}
            />
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Button label="Next →" onPress={next} />
      </View>
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    intro: { paddingHorizontal: 20, paddingTop: 4, gap: 16 },
    hint: { color: colors.muted, fontFamily: fonts.mono, fontSize: 13 },
    fields: { padding: 20, gap: 12, flex: 1 },
    field: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    fieldLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, minWidth: 70 },
    input: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      color: colors.text,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      fontFamily: fonts.body,
      fontSize: 14,
    },
    footer: { padding: 20, paddingBottom: 24 },
  });
