import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatDuration } from '@/lib/format';
import { quietContacts, quietMessage, type QuietContact } from '@/lib/reminders';
import { generateReport, isMonthEnd, isSunday, type PeriodReport } from '@/lib/reports';
import { notify, permissionStatus, requestPermission } from '@/lib/notify';
import { useCalls } from '@/store/CallsProvider';

const STORAGE_KEY = 'calllog.reminders.v1';

type Stored = {
  lastWeeklyReportAt: number | null;
  lastMonthlyReportAt: number | null;
  notifiedQuiet: string[];
};

const DEFAULT_STORED: Stored = {
  lastWeeklyReportAt: null,
  lastMonthlyReportAt: null,
  notifiedQuiet: [],
};

async function readStored(): Promise<Stored> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORED };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      lastWeeklyReportAt: parsed.lastWeeklyReportAt ?? null,
      lastMonthlyReportAt: parsed.lastMonthlyReportAt ?? null,
      notifiedQuiet: Array.isArray(parsed.notifiedQuiet) ? parsed.notifiedQuiet : [],
    };
  } catch {
    return { ...DEFAULT_STORED };
  }
}

async function writeStored(stored: Stored): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Best-effort.
  }
}

export type RemindersState = {
  permission: ReturnType<typeof permissionStatus>;
  quiet: QuietContact[];
  weeklyReport: PeriodReport | null;
  monthlyReport: PeriodReport | null;
  lastRunAt: number | null;
};

export function useReminders() {
  const { calls, hydrated } = useCalls();
  const [permission, setPermission] = useState<ReturnType<typeof permissionStatus>>(permissionStatus());
  const [quiet, setQuiet] = useState<QuietContact[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<PeriodReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<PeriodReport | null>(null);
  const [lastRunAt, setLastRunAt] = useState<number | null>(null);
  const storedRef = useRef<Stored>({ ...DEFAULT_STORED });

  useEffect(() => {
    readStored().then((value) => {
      storedRef.current = value;
    });
  }, []);

  const runCheck = useCallback(async () => {
    if (!hydrated) return;
    const now = new Date();
    const currentStored = storedRef.current;
    const qc = quietContacts(calls, now);
    setQuiet(qc);
    setLastRunAt(now.getTime());

    // Notify for newly-quiet contacts.
    const notified = new Set(currentStored.notifiedQuiet);
    qc.forEach((contact) => {
      if (!notified.has(contact.number)) {
        notify('Call Analyzer — been a while', quietMessage(contact));
        notified.add(contact.number);
      }
    });
    const newStored = { ...currentStored, notifiedQuiet: [...notified] };
    storedRef.current = newStored;
    await writeStored(newStored);

    // Auto weekly report on Sundays.
    if (isSunday(now) && (!currentStored.lastWeeklyReportAt || !sameDay(currentStored.lastWeeklyReportAt, now))) {
      const report = generateReport(calls, 'week', now);
      setWeeklyReport(report);
      const updated = { ...newStored, lastWeeklyReportAt: now.getTime() };
      storedRef.current = updated;
      await writeStored(updated);
      notify('Call Analyzer — weekly report', `Last 7 days: ${report.totalCalls} calls, ${formatDuration(report.totalDuration)}.`);
    }

    // Auto monthly report at month end.
    if (isMonthEnd(now) && (!currentStored.lastMonthlyReportAt || !sameMonth(currentStored.lastMonthlyReportAt, now))) {
      const report = generateReport(calls, 'month', now);
      setMonthlyReport(report);
      const updated = { ...newStored, lastMonthlyReportAt: now.getTime() };
      storedRef.current = updated;
      await writeStored(updated);
      notify('Call Analyzer — monthly report', `This month: ${report.totalCalls} calls.`);
    }
  }, [calls, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      void runCheck();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, calls]);

  const generateWeekly = useCallback(() => {
    const report = generateReport(calls, 'week');
    setWeeklyReport(report);
    const updated = { ...storedRef.current, lastWeeklyReportAt: Date.now() };
    storedRef.current = updated;
    void writeStored(updated);
  }, [calls]);

  const generateMonthly = useCallback(() => {
    const report = generateReport(calls, 'month');
    setMonthlyReport(report);
    const updated = { ...storedRef.current, lastMonthlyReportAt: Date.now() };
    storedRef.current = updated;
    void writeStored(updated);
  }, [calls]);

  const requestPerm = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);
    return result;
  }, []);

  return {
    permission,
    quiet,
    weeklyReport,
    monthlyReport,
    lastRunAt,
    runCheck,
    generateWeekly,
    generateMonthly,
    requestPermission: requestPerm,
  };
}

function sameDay(a: number, now: Date): boolean {
  const d = new Date(a);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function sameMonth(a: number, now: Date): boolean {
  const d = new Date(a);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}