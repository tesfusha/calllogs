import { useReminders } from '@/store/RemindersProvider';

/** Runs the reminder/report checks app-wide without rendering anything. */
export function RemindersRunner() {
  useReminders();
  return null;
}