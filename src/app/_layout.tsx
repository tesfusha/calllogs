import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { Colors } from '@/constants/Colors';
import { CallsProvider } from '@/store/CallsProvider';
import { FavoritesProvider } from '@/store/FavoritesProvider';
import { RemindersRunner } from '@/components/RemindersRunner';
import { ThemeProvider, useTheme } from '@/store/ThemeProvider';

function ThemedNavigator() {
  const { mode } = useTheme();
  const base = mode === 'light' ? DefaultTheme : DarkTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: Colors.accent,
      background: Colors.bg,
      card: Colors.surface,
      text: Colors.text,
      border: Colors.border,
    },
  };

  return (
    <NavTheme value={theme}>
      {/* Keyed remount repaints every StyleSheet with the applied palette. */}
      <Stack
        key={mode}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      />
    </NavTheme>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Best-effort; offline support is optional.
    });
  }, []);

  return (
    <ThemeProvider>
      <CallsProvider>
        <FavoritesProvider>
          <RemindersRunner />
          <StatusBar style="light" />
          <ThemedNavigator />
        </FavoritesProvider>
      </CallsProvider>
    </ThemeProvider>
  );
}
