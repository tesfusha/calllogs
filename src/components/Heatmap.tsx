import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import type { HeatmapCell } from '@/lib/stats';

const BLOCK_LABELS = ['0-6', '6-12', '12-18', '18-24'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type HeatmapProps = {
  cells: HeatmapCell[];
  emptyLabel?: string;
};

/** 7x4 grid: days x time-of-day blocks, coloured by call count. */
export function Heatmap({ cells, emptyLabel = 'No data yet' }: HeatmapProps) {
  const max = Math.max(...cells.map((cell) => cell.count), 0);
  if (max === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.dayLabel} />
        {BLOCK_LABELS.map((label) => (
          <Text key={label} style={styles.blockLabel}>
            {label}
          </Text>
        ))}
      </View>
      {DAY_LABELS.map((dayLabel, day) => (
        <View key={dayLabel} style={styles.row}>
          <Text style={styles.dayLabel}>{dayLabel}</Text>
          {Array.from({ length: 4 }, (_, block) => {
            const cell = cells.find((c) => c.day === day && c.block === block);
            const count = cell?.count ?? 0;
            const intensity = max > 0 ? count / max : 0;
            return (
              <View key={block} style={styles.cell}>
                <View
                  style={[
                    styles.cellFill,
                    { opacity: Math.max(0.08, Math.min(0.85, intensity || 0.08)) },
                  ]}
                />
                <Text style={styles.cellText}>{count > 0 ? count : ''}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    width: 32,
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  blockLabel: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  cell: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  cellFill: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  cellText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});