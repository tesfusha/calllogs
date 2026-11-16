import { StyleSheet, TextInput, View } from 'react-native';

import Head from 'expo-router/head';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TablerIcon } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';
import { pageMetadata, pageTitle } from '@/constants/meta';

export function generateMetadata() {
  return pageMetadata('Dialer');
}

export default function DialerScreen() {
  return (
    <Screen>
      <Head>
        <title>{pageTitle('Dialer')}</title>
      </Head>
      <View style={styles.searchBar}>
        <TablerIcon name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search call history"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search call history"
        />
      </View>
      <EmptyState
        icon="phone"
        title="No calls yet"
        message="Your call history will appear here, grouped by date."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
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
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
});
