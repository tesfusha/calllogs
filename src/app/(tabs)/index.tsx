import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Head from 'expo-router/head';

import { CallDetailModal } from '@/components/CallDetailModal';
import { RemindersModal } from '@/components/RemindersModal';
import { CallRow } from '@/components/CallRow';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TablerIcon } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';
import { pageMetadata, pageTitle } from '@/constants/meta';
import { filterCalls, groupCalls } from '@/lib/calls';
import { avatarColor, initials } from '@/lib/format';

import { useCalls } from '@/store/CallsProvider';
import { useFavorites } from '@/store/FavoritesProvider';
import type { CallRecord } from '@/types/call';

export function generateMetadata() {
  return pageMetadata('Calls');
}

export default function DialerScreen() {
  const { hydrated, calls, patchCall, removeCall } = useCalls();
  const { favorites, toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const visible = useMemo(() => filterCalls(calls, query), [calls, query]);
  const sections = useMemo(() => groupCalls(visible), [visible]);
  const detailCall = useMemo(
    () => (detailId === null ? null : (calls.find((call) => call.id === detailId) ?? null)),
    [calls, detailId],
  );

  const showNotice = useCallback((message: string) => setNotice(message), []);

  useEffect(() => {
    if (notice === null) return;
    const timer = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [notice]);



  const handleCallBack = useCallback(
    (number: string) => {
      Linking.openURL(`tel:${number}`).catch(() => {
        showNotice('This device can’t place calls.');
      });
    },
    [showNotice],
  );

  const handleSave = useCallback(
    (id: string, patch: Parameters<typeof patchCall>[1]) => {
      patchCall(id, patch);
      showNotice('Saved.');
    },
    [patchCall, showNotice],
  );

  const handleDelete = useCallback(
    (id: string) => {
      removeCall(id);
      setDetailId(null);
      showNotice('Call deleted.');
    },
    [removeCall, showNotice],
  );

  const countLabel = `${calls.length} ${calls.length === 1 ? 'call' : 'calls'}`;

  // Favourite contacts: one entry per starred number, using the latest call
  // so we have a name/avatar/time to show. Hidden while searching.
  const favoriteContacts = useMemo(() => {
    if (!hydrated || favorites.size === 0 || query.trim() !== '') return [];
    const byNumber = new Map<string, CallRecord>();
    calls.forEach((call) => {
      if (!favorites.has(call.number)) return;
      const existing = byNumber.get(call.number);
      if (!existing || call.timestamp > existing.timestamp) byNumber.set(call.number, call);
    });
    return [...byNumber.values()].sort((a, b) => b.timestamp - a.timestamp);
  }, [calls, favorites, hydrated, query]);

  return (
    <Screen>
      <Head>
        <title>{pageTitle('Dialer')}</title>
      </Head>

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Recent calls</Text>
          <Text style={styles.headerCount}>{hydrated ? countLabel : ' '}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setRemindersOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Reminders and reports"
            hitSlop={6}
            style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}>
            <TablerIcon name="bell" size={18} color={Colors.accent} />
          </Pressable>
        </View>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, number, note or tag"
      />

      {favoriteContacts.length > 0 && (
        <View style={styles.favorites}>
          <Text style={styles.favoritesLabel}>Favourites</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesRow}>
            {favoriteContacts.map((call) => (
              <Pressable
                key={call.number}
                onPress={() => setDetailId(call.id)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${call.name?.trim() || call.number}`}
                style={({ pressed }) => [styles.favoriteChip, pressed && styles.favoritePressed]}>
                <View style={[styles.favoriteAvatar, { backgroundColor: avatarColor(call.number) }]}>
                  <Text style={styles.favoriteInitials}>{initials(call.name, call.number)}</Text>
                </View>
                <Text style={styles.favoriteName} numberOfLines={1}>
                  {call.name?.trim() || call.number}
                </Text>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(call.number);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from favourites"
                  hitSlop={6}
                  style={styles.favoriteStar}>
                  <TablerIcon name="star" size={13} color={Colors.warning} />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {!hydrated ? (
        <View style={styles.loading} accessibilityLabel="Loading call history">
          <ActivityIndicator color={Colors.textSecondary} />
        </View>
      ) : calls.length === 0 ? (
        <EmptyState
          icon="phone"
          title="No calls yet"
          message="Import a CSV or JSON export in Backup to fill your history. Nothing is pre-loaded."
        />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="search"
          title="No matches"
          message={`Nothing in your history matches “${query.trim()}”.`}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CallRow
              call={item}
              onPress={() => setDetailId(item.id)}
              onCallBack={() => handleCallBack(item.number)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={24}
          windowSize={7}
          ListFooterComponent={
            query.trim() === '' ? undefined : (
              <Text style={styles.footer}>
                {visible.length} of {calls.length} calls
              </Text>
            )
          }
        />
      )}

      <CallDetailModal
        call={detailCall}
        onClose={() => setDetailId(null)}
        onSave={(patch) => detailId && handleSave(detailId, patch)}
        onDelete={() => detailId && handleDelete(detailId)}
        onCallBack={() => detailCall && handleCallBack(detailCall.number)}
      />

      <RemindersModal open={remindersOpen} onClose={() => setRemindersOpen(false)} />

      {notice !== null && (
        <View style={styles.notice} accessibilityRole="alert">
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  headerCount: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
  footer: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  notice: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  noticeText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  favorites: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  favoritesLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  favoritesRow: {
    gap: 8,
    paddingBottom: 4,
  },
  favoriteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    minWidth: 96,
  },
  favoritePressed: {
    opacity: 0.7,
  },
  favoriteAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteInitials: {
    color: Colors.bg,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favoriteName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 80,
  },
  favoriteStar: {
    padding: 2,
  },
});
