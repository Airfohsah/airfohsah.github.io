import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../ui';
import { colors, fonts, radius } from '../../constants/theme';
import { hasAdminPin, setAdminPin, verifyAdminPin } from '../../lib/secure';

export function PinGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [mode, setMode] = useState<'checking' | 'setup' | 'enter'>('checking');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hasAdminPin().then((exists) => setMode(exists ? 'enter' : 'setup'));
  }, []);

  const submitSetup = async () => {
    setError(null);
    if (pin.length < 4) {
      setError('Use at least 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    setBusy(true);
    await setAdminPin(pin);
    setBusy(false);
    onUnlocked();
  };

  const submitEnter = async () => {
    setError(null);
    setBusy(true);
    const ok = await verifyAdminPin(pin);
    setBusy(false);
    if (!ok) {
      setError('Wrong PIN.');
      setPin('');
      return;
    }
    onUnlocked();
  };

  if (mode === 'checking') return <View style={styles.wrap} />;

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{'🔐'}</Text>
      <Text style={styles.title}>{mode === 'setup' ? 'Set an Admin PIN' : 'Enter Admin PIN'}</Text>
      <Text style={styles.subtitle}>
        {mode === 'setup'
          ? "This PIN is stored only on this device and never leaves it. Each device sets its own — it doesn't sync anywhere."
          : 'This device is locked with your admin PIN.'}
      </Text>

      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="PIN"
        placeholderTextColor={colors.muted}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={12}
      />
      {mode === 'setup' && (
        <TextInput
          style={styles.input}
          value={confirmPin}
          onChangeText={setConfirmPin}
          placeholder="Confirm PIN"
          placeholderTextColor={colors.muted}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={12}
        />
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label={mode === 'setup' ? 'Set PIN' : 'Unlock'}
        onPress={mode === 'setup' ? submitSetup : submitEnter}
        loading={busy}
        style={{ width: '100%', marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  icon: { fontSize: 48 },
  title: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center', maxWidth: 300, lineHeight: 19 },
  input: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.text,
    padding: 14,
    borderRadius: radius.lg,
    fontFamily: fonts.mono,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  error: { color: colors.accent2, fontFamily: fonts.mono, fontSize: 12 },
});
