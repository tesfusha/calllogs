import type { Metadata } from 'expo-router/server';

/**
 * Shared static-rendering metadata (SDK 58 `generateMetadata()`).
 * Each route exports `() => pageMetadata('Route title')` so every
 * prerendered page gets its own <title>/<meta> tags.
 */
export const APP_DESCRIPTION =
  'A minimalist call-log companion — analytics, call-back reminders, free Google Drive backup and export. No ads, no paywall.';

export function pageTitle(title?: string): string {
  return title === undefined ? 'Call Log' : `${title} · Call Log`;
}

export function pageMetadata(title?: string): Metadata {
  return {
    title: pageTitle(title),
    description: APP_DESCRIPTION,
  };
}
