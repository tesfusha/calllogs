import Head from 'expo-router/head';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { pageMetadata, pageTitle } from '@/constants/meta';

export function generateMetadata() {
  return pageMetadata('Analytics');
}

export default function AnalyticsScreen() {
  return (
    <Screen title="Analytics">
      <Head>
        <title>{pageTitle('Analytics')}</title>
      </Head>
      <EmptyState
        icon="chart-bar"
        title="No analytics yet"
        message="Totals, incoming/outgoing split and frequency charts appear here once your call log has data."
      />
    </Screen>
  );
}
