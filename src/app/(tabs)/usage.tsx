import Head from 'expo-router/head';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { pageMetadata, pageTitle } from '@/constants/meta';

export function generateMetadata() {
  return pageMetadata('Calls Usage');
}

export default function CallsUsageScreen() {
  return (
    <Screen title="Calls Usage">
      <Head>
        <title>{pageTitle('Calls Usage')}</title>
      </Head>
      <EmptyState
        icon="users"
        title="No usage data yet"
        message="Per-contact and per-SIM call counts and durations appear here once your call log has data."
      />
    </Screen>
  );
}
