import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';

export type HorizontalBarItem = {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  color?: string;
  rightLabel?: string;
};

type HorizontalBarsProps = {
  items: HorizontalBarItem[];
  emptyLabel?: string;
};

/** Horizontal progress bars — used for per-contact durations and SIM usage. */
export function HorizontalBars({ items, emptyLabel = 'No data yet' }: HorizontalBarsProps) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const ratio = item.max > 0 ? Math.min(1, item.value / item.max) : 0;
        return (
          <View key={`${item.label}-${index}`} style={styles.row}>
            <View style={styles.labelColumn}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              {item.sublabel !== undefined && (
                <Text style={styles.sublabel} numberOfLines={1}>
                  {item.sublabel}
                </Text>
              )}
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${Math.max(2, ratio * 100)}%`,
                    backgroundColor: item.color ?? Colors.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.rightLabel}>{item.rightLabel ?? ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelColumn: {
    width: 110,
    gap: 1,
  },
  label: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  sublabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  rightLabel: {
    width: 72,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
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