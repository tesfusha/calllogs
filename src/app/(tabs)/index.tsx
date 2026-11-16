import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Head from 'expo-router/head';

import { Button } from '@/components/Button';
import { CallDetailModal } from '@/components/CallDetailModal';
import { CallRow } from '@/components/CallRow';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/Colors';
import { pageMetadata, pageTitle } from '@/constants/meta';
import { filterCalls, groupCalls } from '@/lib/calls';
import { parseCallImport } from '@/lib/import';
import { pickTextFile } from '@/lib/pickFile';
import { useCalls } from '@/store/CallsProvider';

export function generateMetadata() {
  return pageMetadata('Dialer');
}

export default function DialerScreen() {
  const { hydrated, calls, importCalls, patchCall, removeCall } = useCalls();

  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
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

  const handleImport = useCallback(async () => {
    const file = await pickTextFile();
    if (!file) return;

    const result = parseCallImport(file.text, file.name);
    if (result.calls.length === 0) {
      showNotice(result.problems[0] ?? 'No calls found in that file.');
      return;
    }

    const { added, duplicates } = importCalls(result.calls);
    if (added === 0) {
      showNotice('No new calls — those are already in your history.');
      return;
    }

    const parts = [`Imported ${added} ${added === 1 ? 'call' : 'calls'}`];
    if (duplicates > 0) {
      parts.push(`${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped`);
    }
    if (result.invalid > 0) {
      parts.push(`${result.invalid} row${result.invalid === 1 ? '' : 's'} skipped`);
    }
    showNotice(parts.join(' · '));
  }, [importCalls, showNotice]);

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
        <Button
          label="Import"
          icon="download"
          variant="subtle"
          compact
          onPress={handleImport}
          accessibilityLabel="Import call history from a file"
        />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, number, note or tag"
      />

      {!hydrated ? (
        <View style={styles.loading} accessibilityLabel="Loading call history">
          <ActivityIndicator color={Colors.textSecondary} />
        </View>
      ) : calls.length === 0 ? (
        <EmptyState
          icon="phone"
          title="No calls yet"
          message="Import a CSV or JSON export to fill your history. Nothing is pre-loaded."
          action={
            <Button label="Import calls" icon="download" variant="primary" onPress={handleImport} />
          }
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
});
