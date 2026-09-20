import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Everything in this file is device-local, on-device-encrypted storage
// (Android Keystore-backed via SecureStore). Nothing here is ever bundled
// into app code or sent anywhere — this is exactly what the old admin.html
// got wrong (hardcoded password + token typed into a public web page).
const KEYS = {
  adminPinHash: 'wbt_admin_pin_hash',
  githubToken: 'wbt_github_token',
} as const;

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function hasAdminPin(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(KEYS.adminPinHash);
  return !!hash;
}

export async function setAdminPin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(KEYS.adminPinHash, hash);
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(KEYS.adminPinHash);
  if (!stored) return false;
  const candidate = await hashPin(pin);
  return candidate === stored;
}

export async function clearAdminPin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.adminPinHash);
}

export async function getGithubToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.githubToken);
}

export async function setGithubToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.githubToken, token);
}

export async function clearGithubToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.githubToken);
}
