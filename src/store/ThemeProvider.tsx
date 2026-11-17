import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { applyPalette, type ThemeMode } from '@/constants/Colors';

const THEME_KEY = 'callanalyzer.theme.v1';

type ThemeContextValue = {
  mode: ThemeMode;
  /** Persist + apply the given theme (e.g. from a Settings toggle). */
  setMode: (mode: ThemeMode) => void;
  /** Persist + apply the inverted theme. */
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  // Load persisted theme, then apply the palette so the first paint is correct.
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(THEME_KEY)
      .then((raw) => {
        if (!alive) return;
        const next: ThemeMode = raw === 'light' ? 'light' : 'dark';
        setModeState(next);
        applyPalette(next);
      })
      .catch(() => {
        if (alive) applyPalette('dark');
      });
    return () => {
      alive = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    applyPalette(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {
      // ignore
    });
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, toggle }),
    [mode, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within <ThemeProvider>.');
  return value;
}
