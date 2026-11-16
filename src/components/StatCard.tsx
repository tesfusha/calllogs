import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
};

/** Compact metric tile used across Analytics and Calls Usage. */
export function StatCard({ label, value, hint, accent = false }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      {hint !== undefined && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 120,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  valueAccent: {
    color: Colors.accent,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});