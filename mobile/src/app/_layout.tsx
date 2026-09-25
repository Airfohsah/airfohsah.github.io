import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Syne_400Regular, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { View } from 'react-native';
import { darkColors } from '../constants/theme';
import { GameStoreProvider, useGameStore } from '../store/GameStore';
import { loadWordsFast, refreshWordsFromRemote } from '../lib/words';
import { ensurePushSubscription } from '../lib/push';
import { HomeBackground } from '../components/HomeBackground';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { setWords, loadSettings } = useGameStore();

  useEffect(() => {
    (async () => {
      await loadSettings();
      const { words } = await loadWordsFast();
      setWords(words);
      try {
        const fresh = await refreshWordsFromRemote();
        setWords(fresh);
      } catch {
        // offline or content host unreachable — keep using cached/bundled words
      }
      ensurePushSubscription(); // fire-and-forget, never blocks startup
    })();
  }, [loadSettings, setWords]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Syne_400Regular,
    Syne_700Bold,
    Syne_800ExtraBold,
    DMMono_400Regular,
    DMMono_500Medium,
    PermanentMarker_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    // No custom fonts here on purpose — this shows in the gap between the
    // native splash (a static image, hidden as soon as we get here) and the
    // fonts finishing load, so anything using fonts.brush would flash in a
    // fallback font. The illustration itself has no font dependency, so it
    // carries the same art into that gap without that flash.
    return (
      <View style={{ flex: 1, backgroundColor: darkColors.bg }}>
        <HomeBackground />
      </View>
    );
  }

  return (
    <GameStoreProvider>
      <AppBootstrap>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: darkColors.bg },
          }}
        />
      </AppBootstrap>
    </GameStoreProvider>
  );
}
