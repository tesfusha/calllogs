import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';

export type BarItem = {
  label: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  items: BarItem[];
  /** Max bar height in px. */
  height?: number;
  /** Optional value formatter for the top label. */
  formatValue?: (value: number) => string;
  emptyLabel?: string;
};

/** Simple vertical bar chart built from Views — works on web and native. */
export function BarChart({
  items,
  height = 120,
  formatValue = (value) => String(value),
  emptyLabel = 'No data yet',
}: BarChartProps) {
  if (items.length === 0 || items.every((item) => item.value === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.plot, { height }]}>
        {items.map((item, index) => {
          const barHeight = Math.max(2, (item.value / max) * height);
          return (
            <View key={`${item.label}-${index}`} style={styles.barColumn}>
              <Text style={styles.barValue}>{item.value > 0 ? formatValue(item.value) : ''}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.color ?? Colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {items.map((item, index) => (
          <Text key={`${item.label}-l-${index}`} style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    minHeight: 12,
  },
  barTrack: {
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    borderRadius: 4,
    minHeight: 2,
  },
  labels: {
    flexDirection: 'row',
    gap: 6,
  },
  label: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});