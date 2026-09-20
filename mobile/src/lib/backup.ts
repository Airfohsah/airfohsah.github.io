import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { BackupFileV1, HistoryEntry, AppSettings, WordsData } from '../types';

export class BackupError extends Error {}

function backupFileName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `watin-be-this-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours()
  )}${pad(d.getMinutes())}.json`;
}

export async function writeAndShareBackup(data: {
  words: WordsData;
  history: HistoryEntry[];
  settings: AppSettings;
}): Promise<string> {
  const backup: BackupFileV1 = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: 'watin-be-this',
    words: data.words,
    history: data.history,
    settings: data.settings,
  };

  const file = new File(Paths.cache, backupFileName());
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(backup, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new BackupError('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save your Watin Be This? backup',
  });
  return file.uri;
}

export async function pickAndReadBackup(): Promise<BackupFileV1 | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const picked = new File(result.assets[0].uri);
  let raw: string;
  try {
    raw = await picked.text();
  } catch (e) {
    throw new BackupError('Could not read the selected file.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BackupError('That file is not valid backup JSON.');
  }

  const backup = parsed as Partial<BackupFileV1>;
  if (backup?.app !== 'watin-be-this' || backup?.schemaVersion !== 1) {
    throw new BackupError('That file is not a recognized Watin Be This? backup.');
  }
  if (!backup.words || !Array.isArray(backup.history) || !backup.settings) {
    throw new BackupError('Backup file is missing expected data.');
  }
  return backup as BackupFileV1;
}
