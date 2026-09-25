import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IllustratedScreen, IllustratedHeader, GlowCard, GradientButton, OutlineButton } from '../components/illustrated';
import { fonts, darkColors as colors } from '../constants/theme';
import { useGameStore } from '../store/GameStore';
import { getHistory, setHistory } from '../lib/storage';
import { writeAndShareBackup, pickAndReadBackup, BackupError } from '../lib/backup';
import { hasAdminPin } from '../lib/secure';

const SECRET_TAP_COUNT = 5;
const SECRET_TAP_WINDOW_MS = 1500;

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

  // Admin Panel stays hidden until setup has been completed once on this
  // device (checked via the PIN that only exists after that flow finishes —
  // see AdminGate) — after that it's always visible, no gesture needed. Until
  // then, tapping anywhere on the screen 5 times in a row reveals it for
  // that first-time setup.
  const [adminVisible, setAdminVisible] = useState(false);
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  useEffect(() => {
    hasAdminPin().then((done) => {
      if (done) setAdminVisible(true);
    });
  }, []);

  const handleSecretTap = () => {
    if (adminVisible) return;
    const now = Date.now();
    if (now - lastTapRef.current > SECRET_TAP_WINDOW_MS) tapCountRef.current = 0;
    lastTapRef.current = now;
    tapCountRef.current += 1;
    if (tapCountRef.current >= SECRET_TAP_COUNT) setAdminVisible(true);
  };

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
    <IllustratedScreen>
      <IllustratedHeader title="Settings" onBack={() => router.push('/')} />
      <ScrollView
        contentContainerStyle={styles.content}
        onStartShouldSetResponderCapture={() => {
          handleSecretTap();
          return false;
        }}
      >
        <Text style={styles.sectionTitle}>Game</Text>
        <GlowCard accent="rgba(255,255,255,0.15)" style={{ overflow: 'hidden' }}>
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
        </GlowCard>

        <View style={{ gap: 12 }}>
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Default words per turn</Text>
            <View style={styles.stepperControls}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => updateSettings({ defaultWordCount: Math.max(5, state.settings.defaultWordCount - 5) })}
              >
                <Text style={styles.stepBtnText}>{'−'}</Text>
              </Pressable>
              <Text style={styles.stepVal}>{state.settings.defaultWordCount}</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => updateSettings({ defaultWordCount: Math.min(100, state.settings.defaultWordCount + 5) })}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Default timer (s)</Text>
            <View style={styles.stepperControls}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => updateSettings({ defaultTimerSeconds: Math.max(30, state.settings.defaultTimerSeconds - 30) })}
              >
                <Text style={styles.stepBtnText}>{'−'}</Text>
              </Pressable>
              <Text style={styles.stepVal}>{state.settings.defaultTimerSeconds}</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => updateSettings({ defaultTimerSeconds: Math.min(180, state.settings.defaultTimerSeconds + 30) })}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Backup</Text>
        <Text style={styles.sectionHint}>
          Nothing is stored in the cloud. Export a backup file and save it to your phone, Drive, or
          anywhere else you choose — then restore it later on this device or a new one.
        </Text>
        <View style={{ gap: 12 }}>
          <GradientButton label="Export Backup" onPress={onExport} disabled={busy === 'export'} />
          <OutlineButton label="Restore from Backup" onPress={onImport} disabled={busy === 'import'} />
        </View>

        {adminVisible && (
          <>
            <Text style={styles.sectionTitle}>Content</Text>
            <View style={{ gap: 12 }}>
              <OutlineButton label="Admin Panel" onPress={() => router.push('/admin')} />
            </View>
          </>
        )}
      </ScrollView>
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 24, gap: 14, paddingBottom: 40 },
  sectionTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#8b86ad', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  sectionHint: { fontFamily: fonts.body, fontSize: 13, color: '#c7c2e0', lineHeight: 19 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  toggleLabel: { fontFamily: fonts.body, fontSize: 14, color: '#f5f2ea' },
  pill: { width: 44, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center' },
  pillOn: { backgroundColor: '#1a5c3a' },
  pillKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#8b86ad', marginLeft: 3 },
  pillKnobOn: { backgroundColor: colors.accent3, marginLeft: 23 },
  stepperRow: {
    backgroundColor: 'rgba(8,10,26,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperLabel: { fontSize: 14, color: '#c7c2e0', fontFamily: fonts.body },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: '#f5f2ea', fontSize: 18, lineHeight: 20 },
  stepVal: { fontSize: 16, fontFamily: fonts.displaySemi, color: '#f5f2ea', minWidth: 40, textAlign: 'center' },
});
