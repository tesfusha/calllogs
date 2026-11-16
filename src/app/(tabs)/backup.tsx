import { StyleSheet, Text, View } from 'react-native';

import Head from 'expo-router/head';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TablerIcon } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';
import { pageMetadata, pageTitle } from '@/constants/meta';

export function generateMetadata() {
  return pageMetadata('Backup');
}

const FREE_FEATURES = [
  'Ad-free experience',
  'Notes and tags on your calls',
  'Unlimited backup to Google Drive',
  'Export to CSV, Excel (XLS) and JSON',
] as const;

export default function BackupScreen() {
  return (
    <Screen title="Backup">
      <Head>
        <title>{pageTitle('Backup')}</title>
      </Head>
      <View style={styles.freeCard}>
        <Text style={styles.freeCardHeading}>Free forever</Text>
        <Text style={styles.freeCardSubheading}>Everything is included for everyone.</Text>
        {FREE_FEATURES.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <TablerIcon name="circle-check" size={20} color={Colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      <EmptyState
        icon="cloud-upload"
        title="Nothing backed up yet"
        message="Google Drive backups and exports will appear here."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  freeCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  freeCardHeading: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  freeCardSubheading: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: -6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: Colors.text,
    fontSize: 14,
    flex: 1,
  },
});
