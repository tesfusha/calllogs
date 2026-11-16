import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import Head from 'expo-router/head';

import { CallDetailModal } from '@/components/CallDetailModal';
import { CallRow } from '@/components/CallRow';
import { EmptyState } from '@/components/EmptyState';
import { HorizontalBars } from '@/components/HorizontalBars';
import { PieChart } from '@/components/PieChart';
import { RangeChips } from '@/components/RangeChips';
import { Screen } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { StatCard } from '@/components/StatCard';
import { BarChart } from '@/components/BarChart';
import { Colors } from '@/constants/Colors';
import { pageMetadata, pageTitle } from '@/constants/meta';
import { formatDuration } from '@/lib/format';
import {
  busiestDay,
  contactStats,
  dailyBuckets,
  durationTrends,
  inRange,
  RangeKey,
  simStats,
  topByDuration,
  totals,
} from '@/lib/stats';
import { useCalls } from '@/store/CallsProvider';

export function generateMetadata() {
  return pageMetadata('Analytics');
}

const SUB_TABS = ['Overview', 'Summary', 'Contacts', 'Calls'];

export default function AnalyticsScreen() {
  const { hydrated, calls, patchCall, removeCall } = useCalls();
  const [range, setRange] = useState<RangeKey>('30d');
  const [subTab, setSubTab] = useState(0);
  const [direction, setDirection] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (hydrated ? calls.filter((call) => inRange(call, range)) : []),
    [calls, hydrated, range],
  );

  const t = useMemo(() => totals(filtered), [filtered]);
  const daily = useMemo(() => dailyBuckets(filtered), [filtered]);
  const contacts = useMemo(() => contactStats(filtered), [filtered]);
  const sims = useMemo(() => simStats(filtered), [filtered]);
  const busy = useMemo(() => busiestDay(filtered), [filtered]);
  const topDuration = useMemo(() => topByDuration(filtered), [filtered]);
  const trends = useMemo(() => durationTrends(filtered), [filtered]);

  const pieSlices = [
    { label: 'Incoming', value: t.incoming, color: Colors.incoming },
    { label: 'Outgoing', value: t.outgoing, color: Colors.outgoing },
    { label: 'Missed', value: t.missed, color: Colors.missed },
  ];

  const barItems = daily.map((bucket) => ({
    label: bucket.label.replace(/^(\w{3}).*/, '$1').slice(0, 3),
    value: bucket.count,
    color: Colors.accent,
  }));

  // Keep at most 14 bars so labels stay readable.
  const barSlice =
    barItems.length > 14 ? barItems.slice(barItems.length - 14) : barItems;

  const callsList = useMemo(() => {
    const base = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    if (direction === 'all') return base;
    return base.filter((call) => call.direction === direction);
  }, [filtered, direction]);

  const detailCall = useMemo(
    () => (detailId === null ? null : (calls.find((call) => call.id === detailId) ?? null)),
    [calls, detailId],
  );

  if (!hydrated) {
    return (
      <Screen title="Analytics">
        <Head>
          <title>{pageTitle('Analytics')}</title>
        </Head>
      </Screen>
    );
  }

  if (calls.length === 0) {
    return (
      <Screen title="Analytics">
        <Head>
          <title>{pageTitle('Analytics')}</title>
        </Head>
        <EmptyState
          icon="chart-bar"
          title="No analytics yet"
          message="Totals, incoming/outgoing split and frequency charts appear here once your call log has data."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Analytics">
      <Head>
        <title>{pageTitle('Analytics')}</title>
      </Head>

      <RangeChips value={range} onChange={setRange} />

      <SegmentedTabs tabs={SUB_TABS} value={subTab} onChange={setSubTab} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {subTab === 0 && (
          <View style={styles.section}>
            <View style={styles.statsRow}>
              <StatCard label="Total calls" value={String(t.count)} accent />
              <StatCard label="Total time" value={formatDuration(t.totalDuration)} />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="Incoming" value={String(t.incoming)} hint={formatDuration(t.incomingDuration)} />
              <StatCard label="Outgoing" value={String(t.outgoing)} hint={formatDuration(t.outgoingDuration)} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Direction split</Text>
              <PieChart
                slices={pieSlices}
                centerValue={String(t.count)}
                centerLabel="calls"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Calls per day</Text>
              <BarChart items={barSlice} emptyLabel="No calls in this range" />
            </View>
          </View>
        )}

        {subTab === 1 && (
          <View style={styles.section}>
            <View style={styles.statsRow}>
              <StatCard label="Avg duration" value={formatDuration(t.avgDuration)} />
              <StatCard label="Missed" value={String(t.missed)} hint={formatDuration(t.missedDuration)} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Duration by direction</Text>
              <HorizontalBars
                items={[
                  {
                    label: 'Incoming',
                    value: t.incomingDuration,
                    max: Math.max(t.incomingDuration, t.outgoingDuration, 1),
                    color: Colors.incoming,
                    rightLabel: formatDuration(t.incomingDuration),
                  },
                  {
                    label: 'Outgoing',
                    value: t.outgoingDuration,
                    max: Math.max(t.incomingDuration, t.outgoingDuration, 1),
                    color: Colors.outgoing,
                    rightLabel: formatDuration(t.outgoingDuration),
                  },
                ]}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Highlights</Text>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Busiest day</Text>
                <Text style={styles.highlightValue}>
                  {busy ? `${busy.label} (${busy.count} calls)` : '—'}
                </Text>
              </View>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Longest talker</Text>
                <Text style={styles.highlightValue}>
                  {topDuration ? `${topDuration.name} (${formatDuration(topDuration.duration)})` : '—'}
                </Text>
              </View>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Unique contacts</Text>
                <Text style={styles.highlightValue}>{contacts.length}</Text>
              </View>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>SIM 1 / SIM 2</Text>
                <Text style={styles.highlightValue}>
                  {sims
                    .map((sim) => `${sim.sim.replace('SIM ', 'S')}: ${sim.count}`)
                    .join('  ·  ')}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Duration trends</Text>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Avg (all)</Text>
                <Text style={styles.highlightValue}>{formatDuration(trends.avgAll)}</Text>
              </View>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Avg (7 days)</Text>
                <Text style={styles.highlightValue}>{formatDuration(trends.avg7d)}</Text>
              </View>
              <View style={styles.highlightRow}>
                <Text style={styles.highlightLabel}>Avg (30 days)</Text>
                <Text style={styles.highlightValue}>{formatDuration(trends.avg30d)}</Text>
              </View>
              {trends.longest && (
                <View style={styles.highlightRow}>
                  <Text style={styles.highlightLabel}>Longest call</Text>
                  <Text style={styles.highlightValue}>
                    {trends.longest.name} ({formatDuration(trends.longest.duration)})
                  </Text>
                </View>
              )}
              {trends.shortest && (
                <View style={styles.highlightRow}>
                  <Text style={styles.highlightLabel}>Shortest call</Text>
                  <Text style={styles.highlightValue}>
                    {trends.shortest.name} ({formatDuration(trends.shortest.duration)})
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {subTab === 2 && (
          <View style={styles.section}>
            {contacts.length === 0 ? (
              <EmptyState icon="users" title="No contacts" message="No calls in this range." />
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Top contacts by calls</Text>
                <HorizontalBars
                  items={contacts.slice(0, 12).map((contact) => ({
                    label: contact.name,
                    sublabel: `${contact.count} calls`,
                    value: contact.count,
                    max: contacts[0].count,
                    color: Colors.accent,
                    rightLabel: formatDuration(contact.duration),
                  }))}
                />
              </View>
            )}

            {contacts.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Top contacts by duration</Text>
                <HorizontalBars
                  items={[...contacts]
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 12)
                    .map((contact) => ({
                      label: contact.name,
                      sublabel: `${contact.count} calls`,
                      value: contact.duration,
                      max: Math.max(...contacts.map((c) => c.duration), 1),
                      color: Colors.outgoing,
                      rightLabel: formatDuration(contact.duration),
                    }))}
                />
              </View>
            )}
          </View>
        )}

        {subTab === 3 && (
          <View style={styles.section}>
            <View style={styles.filterRow}>
              {(['all', 'incoming', 'outgoing', 'missed'] as const).map((key) => {
                const active = direction === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setDirection(key)}
                    style={[styles.filterChip, active && styles.filterChipActive]}>
                    <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                      {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {callsList.length === 0 ? (
              <EmptyState icon="search" title="No calls" message="Nothing in this range." />
            ) : (
              <View>
                {callsList.map((call) => (
                  <CallRow
                    key={call.id}
                    call={call}
                    onPress={() => setDetailId(call.id)}
                    onCallBack={() => {
                      Linking.openURL(`tel:${call.number}`).catch(() => {});
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <CallDetailModal
        call={detailCall}
        onClose={() => setDetailId(null)}
        onSave={(patch) => detailId && patchCall(detailId, patch)}
        onDelete={() => {
          if (detailId) {
            removeCall(detailId);
            setDetailId(null);
          }
        }}
        onCallBack={() => detailCall && Linking.openURL(`tel:${detailCall.number}`).catch(() => {})}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    gap: 12,
  },
  section: {
    gap: 12,
    paddingHorizontal: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  highlightLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  highlightValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  filterLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: Colors.accent,
  },
});