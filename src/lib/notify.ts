import { Platform } from 'react-native';

export type NotifyPermission = 'granted' | 'denied' | 'default' | 'unsupported';

/** Request notification permission on web; no-op on native (handled by expo-notifications separately). */
export async function requestPermission(): Promise<NotifyPermission> {
  if (Platform.OS !== 'web') return 'unsupported';
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const result = await Notification.requestPermission();
    return result as NotifyPermission;
  } catch {
    return 'default';
  }
}

export function permissionStatus(): NotifyPermission {
  if (Platform.OS !== 'web') return 'unsupported';
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotifyPermission;
}

/** Fire a notification. On web uses the Notification API; on native this is a no-op (native packaging is separate). */
export function notify(title: string, body: string): void {
  if (Platform.OS !== 'web') return;
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch {
    // Swallow — notifications are best-effort.
  }
}