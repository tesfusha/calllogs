import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TablerIcon, type TablerIconName } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';

type EmptyStateProps = {
  icon: TablerIconName;
  title: string;
  message: string;
  /** Optional call to action — e.g. the "Import calls" button. */
  action?: ReactNode;
};

/**
 * Empty-by-default placeholder shown on every tab until the user has data.
 * The app ships with no demo data, so this is the first thing people see.
 */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.iconCircle}>
        <TablerIcon name={icon} size={32} color={Colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  action: {
    marginTop: 16,
  },
});
