import { PermissionsAndroid, Platform } from 'react-native';
import { getPushSubscribed, setPushSubscribed } from './storage';

// Firebase owns the subscriber list for this topic — the app just joins it
// once. A GitHub Action posts to it whenever words.json changes, so every
// subscribed device gets notified of new/updated word content. No server
// of our own to host or maintain.
//
// Namespaced with the app's own prefix + package name on purpose: the
// Firebase project this app lives in is shared with other apps, and FCM
// topics are project-wide, not per-app — a generic name like "word-updates"
// could collide with another app's topic in the same project.
export const WORD_UPDATES_TOPIC = 'wbt-naijacharades-word-updates';

// Native Firebase Messaging only exists in a real prebuilt/standalone build
// (not Expo Go), so this is wrapped defensively and never blocks app
// startup — a device that can't subscribe just won't get push alerts.
export async function ensurePushSubscription(): Promise<void> {
  try {
    if (await getPushSubscribed()) return;

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    const { getMessaging, subscribeToTopic } = await import('@react-native-firebase/messaging');
    const messaging = getMessaging();
    await subscribeToTopic(messaging, WORD_UPDATES_TOPIC);
    await setPushSubscribed();
  } catch {
    // No Google Play services, no native Firebase module (Expo Go), or the
    // user declined the permission — the app works fine without push.
  }
}
