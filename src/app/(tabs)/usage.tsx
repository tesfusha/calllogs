import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Head from 'expo-router/head';

import { EmptyState } from '@/components/EmptyState';
import { HorizontalBars } from '@/components/HorizontalBars';
import { RangeChips } from '@/components/RangeChips';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { Colors } from '@/constants/Colors';
import { pageMetadata, pageTitle } from '@/constants/meta';
import { formatDuration } from '@/lib/format';
import {
  contactStats,
  inRange,
  RangeKey,
  simStats,
  totals,
} from '@/lib/stats';
import { useCalls } from '@/store/CallsProvider';

export function generateMetadata() {
  return pageMetadata('Calls Usage');
}

type SimFilter = 'all' | 'SIM 1' | 'SIM 2';

export default function CallsUsageScreen() {
  const { hydrated, calls } = useCalls();
  const [range, setRange] = useState<RangeKey>('30d');
  const [sim, setSim] = useState<SimFilter>('all');
  const [direction, setDirection] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');

  const filtered = useMemo(() => {
    if (!hydrated) return [];
    return calls.filter((call) => {
      if (!inRange(call, range)) return false;
      if (sim !== 'all' && call.sim !== sim) return false;
      if (direction !== 'all' && call.direction !== direction) return false;
      return true;
    });
  }, [calls, hydrated, range, sim, direction]);

  const t = useMemo(() => totals(filtered), [filtered]);
  const contacts = useMemo(() => contactStats(filtered), [filtered]);
  const sims = useMemo(() => simStats(filtered), [filtered]);

  if (!hydrated) {
    return (
      <Screen title="Calls Usage">
        <Head>
          <title>{pageTitle('Calls Usage')}</title>
        </Head>
      </Screen>
    );
  }

  if (calls.length === 0) {
    return (
      <Screen title="Calls Usage">
        <Head>
          <title>{pageTitle('Calls Usage')}</title>
        </Head>
        <EmptyState
          icon="users"
          title="No usage data yet"
          message="Per-contact and per-SIM call counts and durations appear here once your call log has data."
        />
      </Screen>
    );
  }

  const maxContactDuration = Math.max(...contacts.map((c) => c.duration), 1);

  const simBars = sims
    .filter((s) => s.count > 0 || s.sim !== 'Unknown')
    .map((s) => ({
      label: s.sim,
      sublabel: `${s.count} calls`,
      value: s.duration,
      max: Math.max(...sims.map((x) => x.duration), 1),
      color: s.sim === 'SIM 1' ? Colors.accent : Colors.outgoing,
      rightLabel: formatDuration(s.duration),
    }));

  const directionBars = [
    { label: 'Incoming', value: t.incoming, color: Colors.incoming },
    { label: 'Outgoing', value: t.outgoing, color: Colors.outgoing },
    { label: 'Missed', value: t.missed, color: Colors.missed },
  ];
  const maxDir = Math.max(...directionBars.map((d) => d.value), 1);

  return (
    <Screen title="Calls Usage">
      <Head>
        <title>{pageTitle('Calls Usage')}</title>
      </Head>

      <RangeChips value={range} onChange={setRange} />

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>SIM</Text>
        <View style={styles.filterRow}>
          {(['all', 'SIM 1', 'SIM 2'] as const).map((key) => {
            const active = sim === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSim(key)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {key === 'all' ? 'All' : key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Direction</Text>
        <View style={styles.filterRow}>
          {(['all', 'incoming', 'outgoing', 'missed'] as const).map((key) => {
            const active = direction === key;
            return (
              <Pressable
                key={key}
                onPress={() => setDirection(key)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard label="Calls" value={String(t.count)} accent />
          <StatCard label="Duration" value={formatDuration(t.totalDuration)} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Incoming" value={String(t.incoming)} hint={formatDuration(t.incomingDuration)} />
          <StatCard label="Outgoing" value={String(t.outgoing)} hint={formatDuration(t.outgoingDuration)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>By SIM</Text>
          <HorizontalBars items={simBars} emptyLabel="No calls in this range" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>By direction</Text>
          <HorizontalBars
            items={directionBars.map((d) => ({
              label: d.label,
              value: d.value,
              max: maxDir,
              color: d.color,
              rightLabel: String(d.value),
            }))}
            emptyLabel="No calls in this range"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top contacts by duration</Text>
          <HorizontalBars
            items={contacts.slice(0, 15).map((contact) => ({
              label: contact.name,
              sublabel: `${contact.count} calls`,
              value: contact.duration,
              max: maxContactDuration,
              color: Colors.accent,
              rightLabel: formatDuration(contact.duration),
            }))}
            emptyLabel="No calls in this range"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top contacts by calls</Text>
          <HorizontalBars
            items={contacts.slice(0, 15).map((contact) => ({
              label: contact.name,
              sublabel: formatDuration(contact.duration),
              value: contact.count,
              max: contacts.length > 0 ? contacts[0].count : 1,
              color: Colors.outgoing,
              rightLabel: String(contact.count),
            }))}
            emptyLabel="No calls in this range"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterGroup: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  filterLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.accent,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    gap: 12,
    paddingTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});