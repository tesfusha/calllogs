import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';

type ScreenProps = {
  /** Optional page title rendered at the top (e.g. "Calls Usage"). */
  title?: string;
  children: ReactNode;
};

/**
 * Standard screen frame: dark background, top safe-area, optional title.
 * The bottom safe-area is handled by the tab bar.
 */
export function Screen({ title, children }: ScreenProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {title !== undefined && <Text style={styles.title}>{title}</Text>}
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
});
