import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../ui';
import { fonts, Palette, radius } from '../../constants/theme';
import { useTheme } from '../../store/ThemeContext';
import { hasAdminPin, setAdminPin, verifyAdminPin, getGithubToken, setGithubToken } from '../../lib/secure';
import { getGithubConfig } from '../../lib/storage';
import { verifyGithubToken } from '../../lib/github';

// One-time setup, in order: GitHub token first (proves you're the admin —
// see lib/github.ts), then a local PIN (device-only convenience lock).
// Once both are set, later visits just ask for the PIN.
type Mode = 'checking' | 'token' | 'pin-setup' | 'enter';

export function AdminGate({ onUnlocked }: { onUnlocked: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [mode, setMode] = useState<Mode>('checking');
  const [token, setTokenInput] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [existingToken, pinExists] = await Promise.all([getGithubToken(), hasAdminPin()]);
      if (!existingToken) setMode('token');
      else if (!pinExists) setMode('pin-setup');
      else setMode('enter');
    })();
  }, []);

  const submitToken = async () => {
    setError(null);
    if (!token.trim()) {
      setError('Enter a token.');
      return;
    }
    setBusy(true);
    const config = await getGithubConfig();
    const ok = await verifyGithubToken(config, token.trim());
    if (!ok) {
      setBusy(false);
      setError("That token couldn't access the repo. Check it and try again.");
      return;
    }
    await setGithubToken(token.trim());
    setBusy(false);
    setTokenInput('');
    const pinExists = await hasAdminPin();
    setMode(pinExists ? 'enter' : 'pin-setup');
  };

  const submitPinSetup = async () => {
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

  if (mode === 'token') {
    return (
      <View style={styles.wrap}>
        <Text style={styles.icon}>{'🔑'}</Text>
        <Text style={styles.title}>Connect GitHub</Text>
        <Text style={styles.subtitle}>
          A GitHub token is what makes you the admin — it's what actually authorizes publishing word-list
          changes. Enter it once; it's stored only on this device.
        </Text>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setTokenInput}
          placeholder="ghp_... or github_pat_..."
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoCapitalize="none"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button label="Verify & Continue" onPress={submitToken} loading={busy} style={{ width: '100%', marginTop: 8 }} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{'🔐'}</Text>
      <Text style={styles.title}>{mode === 'pin-setup' ? 'Set an Admin PIN' : 'Enter Admin PIN'}</Text>
      <Text style={styles.subtitle}>
        {mode === 'pin-setup'
          ? "Last step. This PIN is stored only on this device and never leaves it. Each device sets its own — it doesn't sync anywhere."
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
      {mode === 'pin-setup' && (
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
        label={mode === 'pin-setup' ? 'Set PIN' : 'Unlock'}
        onPress={mode === 'pin-setup' ? submitPinSetup : submitEnter}
        loading={busy}
        style={{ width: '100%', marginTop: 8 }}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
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
  error: { color: colors.accent2, fontFamily: fonts.mono, fontSize: 12, textAlign: 'center' },
});
