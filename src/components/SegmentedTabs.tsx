import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/Colors';

type SegmentedTabsProps = {
  tabs: string[];
  value: number;
  onChange: (index: number) => void;
};

/** Horizontally scrollable segmented control for sub-tabs. */
export function SegmentedTabs({ tabs, value, onChange }: SegmentedTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {tabs.map((tab, index) => {
        const active = index === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.accent,
  },
});