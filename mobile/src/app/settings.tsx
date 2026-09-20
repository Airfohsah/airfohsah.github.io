import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenHeader, Screen, Stepper } from '../components/ui';
import { colors, fonts, radius } from '../constants/theme';
import { useGameStore } from '../store/GameStore';
import { getHistory, setHistory } from '../lib/storage';
import { writeAndShareBackup, pickAndReadBackup, BackupError } from '../lib/backup';

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.toggleRow} onPress={onToggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.pill, value && styles.pillOn]}>
        <View style={[styles.pillKnob, value && styles.pillKnobOn]} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { state, updateSettings, setWords } = useGameStore();
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  const onExport = async () => {
    setBusy('export');
    try {
      const history = await getHistory();
      await writeAndShareBackup({ words: state.words, history, settings: state.settings });
    } catch (e) {
      const msg = e instanceof BackupError ? e.message : 'Could not export backup.';
      Alert.alert('Export failed', msg);
    } finally {
      setBusy(null);
    }
  };

  const onImport = async () => {
    setBusy('import');
    try {
      const backup = await pickAndReadBackup();
      if (!backup) return; // canceled
      Alert.alert(
        'Restore backup?',
        `This backup was exported ${new Date(backup.exportedAt).toLocaleString()}. It will replace your current word lists, history, and settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              await setHistory(backup.history);
              setWords(backup.words);
              await updateSettings(backup.settings);
              Alert.alert('Restored', 'Your backup has been restored.');
            },
          },
        ]
      );
    } catch (e) {
      const msg = e instanceof BackupError ? e.message : 'Could not read that backup file.';
      Alert.alert('Restore failed', msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Settings" onBack={() => router.push('/')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Game</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Sound effects"
            value={state.settings.soundEnabled}
            onToggle={() => updateSettings({ soundEnabled: !state.settings.soundEnabled })}
          />
          <ToggleRow
            label="Tilt to skip / got it"
            value={state.settings.tiltEnabled}
            onToggle={() => updateSettings({ tiltEnabled: !state.settings.tiltEnabled })}
          />
        </View>

        <View style={{ gap: 12 }}>
          <Stepper
            label="Default words per turn"
            value={state.settings.defaultWordCount}
            onDecrement={() => updateSettings({ defaultWordCount: Math.max(5, state.settings.defaultWordCount - 5) })}
            onIncrement={() => updateSettings({ defaultWordCount: Math.min(100, state.settings.defaultWordCount + 5) })}
          />
          <Stepper
            label="Default timer (s)"
            value={state.settings.defaultTimerSeconds}
            onDecrement={() => updateSettings({ defaultTimerSeconds: Math.max(30, state.settings.defaultTimerSeconds - 30) })}
            onIncrement={() => updateSettings({ defaultTimerSeconds: Math.min(180, state.settings.defaultTimerSeconds + 30) })}
          />
        </View>

        <Text style={styles.sectionTitle}>Backup</Text>
        <Text style={styles.sectionHint}>
          Nothing is stored in the cloud. Export a backup file and save it to your phone, Drive, or
          anywhere else you choose — then restore it later on this device or a new one.
        </Text>
        <View style={{ gap: 12 }}>
          <Button label="Export Backup" onPress={onExport} loading={busy === 'export'} />
          <Button label="Restore from Backup" variant="secondary" onPress={onImport} loading={busy === 'import'} />
        </View>

        <Text style={styles.sectionTitle}>Content</Text>
        <View style={{ gap: 12 }}>
          <Button label="Admin Panel" variant="secondary" onPress={() => router.push('/admin')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  sectionHint: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 19 },
  card: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: colors.border },
  toggleLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  pill: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, justifyContent: 'center' },
  pillOn: { backgroundColor: '#1a5c3a' },
  pillKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.muted, marginLeft: 3 },
  pillKnobOn: { backgroundColor: colors.accent3, marginLeft: 23 },
});
