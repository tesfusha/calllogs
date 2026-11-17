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

const FAVORITES_KEY = 'callanalyzer.favorites.v1';

type FavoritesContextValue = {
  hydrated: boolean;
  /** Set of favourited phone numbers. */
  favorites: Set<string>;
  /** True if the number is starred. */
  isFavorite: (number: string) => boolean;
  /** Star/unstar a number. Returns the new state. */
  toggleFavorite: (number: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(FAVORITES_KEY)
      .then((raw) => {
        if (!alive) return;
        const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
        setFavorites(new Set(list));
        setHydrated(true);
      })
      .catch(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setFavorites(next);
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])).catch(() => {
      // ignore
    });
  }, []);

  const isFavorite = useCallback(
    (number: string) => favorites.has(number),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (number: string): boolean => {
      const next = new Set(favorites);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      persist(next);
      return next.has(number);
    },
    [favorites, persist],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ hydrated, favorites, isFavorite, toggleFavorite }),
    [hydrated, favorites, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites must be used within <FavoritesProvider>.');
  return value;
}
