import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/Colors';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.accent,
    background: Colors.bg,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      />
    </ThemeProvider>
  );
}
