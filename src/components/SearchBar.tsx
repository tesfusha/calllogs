import type { ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { TablerIcon } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Trailing affordance — the import button lives here on the Dialer. */
  trailing?: ReactNode;
};

/** Rounded search field shared by every list screen. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  trailing,
}: SearchBarProps) {
  return (
    <View style={styles.bar}>
      <TablerIcon name="search" size={20} color={Colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        clearButtonMode="never"
      />
      {value !== '' && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          style={styles.clear}>
          <TablerIcon name="x" size={16} color={Colors.textSecondary} />
        </Pressable>
      )}
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  clear: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
