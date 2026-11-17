import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Head from 'expo-router/head';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TablerIcon } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';
import { pageMetadata, pageTitle } from '@/constants/meta';
import { downloadBackup, parseBackup } from '@/lib/backup';
import { exportCalls } from '@/lib/export';
import { pickTextFile } from '@/lib/pickFile';
import { readDeviceCallLog, requestCallLogPermissions } from '@/lib/nativeCallLog';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useCalls } from '@/store/CallsProvider';

const SETTINGS_KEY = 'calllog.backupSettings.v1';
const PROFILE_KEY = 'calllog.profile.v1';

type BackupSettings = {
  weeklySchedule: boolean;
  wifiOnly: boolean;
  autoExportWeekly: boolean;
  autoExportMonthly: boolean;
  autoExportFormat: 'csv' | 'json';
};

const DEFAULT_SETTINGS: BackupSettings = {
  weeklySchedule: false,
  wifiOnly: true,
  autoExportWeekly: false,
  autoExportMonthly: false,
  autoExportFormat: 'csv',
};

type Profile = {
  name: string;
};

export function generateMetadata() {
  return pageMetadata('Settings');
}

export default function SettingsScreen() {
  const { hydrated, calls, importCalls, removeCall } = useCalls();
  const drive = useGoogleDrive();
  const [settings, setSettings] = useState<BackupSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile>({ name: '' });
  const [profileDraft, setProfileDraft] = useState('');
  const [lastBackupAt, setLastBackupAt] = useState<number | null>(null);
  const [lastAutoExportAt, setLastAutoExportAt] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [readingNative, setReadingNative] = useState(false);

  // Auto-dismiss toast notifications after 5 seconds so they never linger.
  useEffect(() => {
    if (notice === null) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      } catch {
        // ignore
      }
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) {
          const p = JSON.parse(raw) as Profile;
          setProfile(p);
          setProfileDraft(p.name ?? '');
        }
      } catch {
        // ignore
      }
      try {
        const raw = await AsyncStorage.getItem('calllog.lastBackupAt');
        if (raw) setLastBackupAt(Number(raw));
      } catch {
        // ignore
      }
      try {
        const raw = await AsyncStorage.getItem('calllog.lastAutoExportAt');
        if (raw) setLastAutoExportAt(Number(raw));
      } catch {
        // ignore
      }
    })();
  }, []);

  const persistSettings = useCallback(async (next: BackupSettings) => {
    setSettings(next);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const saveProfile = useCallback(async () => {
    const next: Profile = { name: profileDraft.trim() };
    setProfile(next);
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setNotice('Profile saved.');
  }, [profileDraft]);

  const handleReadDeviceCalls = useCallback(async () => {
    setReadingNative(true);
    try {
      const permission = await requestCallLogPermissions();
      if (permission === 'denied') {
        setNotice('Call-log permission denied. Enable it in system settings.');
        return;
      }
      const records = await readDeviceCallLog();
      if (records === null) {
        setNotice('Device call log isn’t available on this build. Import a CSV/JSON instead.');
        return;
      }
      if (records.length === 0) {
        setNotice('No calls found in the device call log.');
        return;
      }
      const { added, duplicates } = importCalls(records);
      setNotice(
        `Read ${added} call${added === 1 ? '' : 's'} from device${
          duplicates > 0 ? ` · ${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped` : ''
        }`,
      );
    } catch (err) {
      setNotice(`Couldn’t read the call log: ${String(err)}`);
    } finally {
      setReadingNative(false);
    }
  }, [importCalls]);

  const handleExport = useCallback(
    (format: 'csv' | 'json' | 'xls') => {
      if (calls.length === 0) {
        setNotice('Nothing to export yet.');
        return;
      }
      exportCalls(calls, format);
      setNotice(`Exported ${calls.length} calls as ${format.toUpperCase()}.`);
    },
    [calls],
  );

  const handleBackupNow = useCallback(() => {
    if (calls.length === 0) {
      setNotice('Nothing to back up yet.');
      return;
    }
    downloadBackup(calls);
    const now = Date.now();
    setLastBackupAt(now);
    try {
      AsyncStorage.setItem('calllog.lastBackupAt', String(now));
    } catch {
      // ignore
    }
    setNotice(`Backed up ${calls.length} calls.`);
  }, [calls]);

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    try {
      const file = await pickTextFile();
      if (!file) {
        setRestoring(false);
        return;
      }
      const { calls: restored, error } = parseBackup(file.text);
      if (error) {
        setNotice(error);
        setRestoring(false);
        return;
      }
      const { added } = importCalls(restored);
      setNotice(
        added > 0
          ? `Restored ${added} new call${added === 1 ? '' : 's'} from backup.`
          : 'No new calls — backup already imported.',
      );
    } catch {
      setNotice('Restore failed.');
    } finally {
      setRestoring(false);
    }
  }, [importCalls]);

  const runAutoExport = useCallback(
    (kind: 'weekly' | 'monthly') => {
      if (calls.length === 0) {
        setNotice('Nothing to export yet.');
        return;
      }
      exportCalls(calls, settings.autoExportFormat);
      const now = Date.now();
      setLastAutoExportAt(now);
      try {
        AsyncStorage.setItem('calllog.lastAutoExportAt', String(now));
      } catch {
        // ignore
      }
      setNotice(`Auto-exported ${calls.length} calls (${kind}, ${settings.autoExportFormat.toUpperCase()}).`);
    },
    [calls, settings.autoExportFormat],
  );

  const handleClearImported = useCallback(() => {
    if (calls.length === 0) {
      setNotice('Nothing to clear.');
      return;
    }
    calls.forEach((call) => removeCall(call.id));
    setNotice('Cleared all imported calls.');
  }, [calls, removeCall]);

  const handleConnectDrive = useCallback(() => {
    if (drive.user) {
      drive.signOut();
      setNotice('Disconnected from Google Drive.');
    } else {
      drive.signIn();
    }
  }, [drive]);

  const handleDriveBackup = useCallback(async () => {
    if (!drive.accessToken) {
      setNotice('Connect Google Drive first.');
      return;
    }
    if (calls.length === 0) {
      setNotice('Nothing to back up yet.');
      return;
    }
    try {
      const { uploadBackup } = await import('@/lib/drive');
      const id = await uploadBackup(drive.accessToken, calls);
      setNotice(`Backed up ${calls.length} calls to Google Drive (${id.slice(0, 8)}…).`);
    } catch (err) {
      setNotice(`Drive backup failed: ${String(err)}`);
    }
  }, [drive, calls]);

  const handleDriveRestore = useCallback(async () => {
    if (!drive.accessToken) {
      setNotice('Connect Google Drive first.');
      return;
    }
    setRestoring(true);
    try {
      const { listBackups, restoreFromDrive } = await import('@/lib/drive');
      const files = await listBackups(drive.accessToken);
      if (files.length === 0) {
        setNotice('No backups found in Google Drive.');
        setRestoring(false);
        return;
      }
      const latest = files[0];
      const { calls: restored, error } = await restoreFromDrive(drive.accessToken, latest.id);
      if (error) {
        setNotice(error);
        setRestoring(false);
        return;
      }
      const { added } = importCalls(restored);
      setNotice(
        added > 0
          ? `Restored ${added} new call${added === 1 ? '' : 's'} from Google Drive.`
          : 'No new calls — backup already imported.',
      );
    } catch (err) {
      setNotice(`Drive restore failed: ${String(err)}`);
    } finally {
      setRestoring(false);
    }
  }, [drive, importCalls]);

  if (!hydrated) {
    return (
      <Screen title="Settings">
        <Head>
          <title>{pageTitle('Settings')}</title>
        </Head>
      </Screen>
    );
  }

  return (
    <Screen title="Settings">
      <Head>
        <title>{pageTitle('Settings')}</title>
      </Head>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.freeBanner}>
          <TablerIcon name="circle-check" size={18} color={Colors.success} />
          <Text style={styles.freeText}>Free for everyone — no paywall, no ads, no limits.</Text>
        </View>

        {/* Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <TextInput
            style={styles.input}
            value={profileDraft}
            onChangeText={setProfileDraft}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            accessibilityLabel="Profile name"
          />
          <Button label="Save profile" icon="check" variant="primary" onPress={saveProfile} />
          {profile.name ? <Text style={styles.hint}>Saved: {profile.name}</Text> : null}
        </View>

        {/* Google account */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Google account</Text>
          <View style={styles.driveRow}>
            <TablerIcon name="cloud" size={18} color={Colors.textSecondary} />
            <View style={styles.driveBody}>
              <Text style={styles.driveTitle}>Google Drive</Text>
              <Text style={styles.driveHint}>
                {drive.loading
                  ? 'Loading…'
                  : drive.user
                    ? drive.user.email
                    : drive.configured
                      ? 'Not connected.'
                      : 'Not configured — set expo.extra.googleClientId.'}
              </Text>
              {drive.error ? <Text style={styles.driveError}>{drive.error}</Text> : null}
            </View>
            <Button
              label={drive.user ? 'Disconnect' : 'Connect'}
              icon="external-link"
              variant="subtle"
              compact
              onPress={handleConnectDrive}
            />
          </View>
          {drive.user && (
            <View style={styles.buttonRow}>
              <Button label="Back up to Drive" icon="cloud-upload" variant="primary" onPress={handleDriveBackup} />
              <Button
                label={restoring ? 'Restoring…' : 'Restore from Drive'}
                icon="cloud-download"
                variant="subtle"
                onPress={handleDriveRestore}
                disabled={restoring}
              />
            </View>
          )}
        </View>

        {/* Backup & restore (file) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup & restore (file)</Text>
          <Text style={styles.cardHint}>Back up to a file, or restore from one. Works offline.</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Calls stored</Text>
            <Text style={styles.statusValue}>{calls.length}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last backup</Text>
            <Text style={styles.statusValue}>
              {lastBackupAt ? new Date(lastBackupAt).toLocaleString() : 'Never'}
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <Button label="Back up now" icon="cloud-upload" variant="primary" onPress={handleBackupNow} />
            <Button
              label={restoring ? 'Restoring…' : 'Restore'}
              icon="cloud-download"
              variant="subtle"
              onPress={handleRestore}
              disabled={restoring}
            />
            <Button label="Clear imported" icon="trash" variant="danger" onPress={handleClearImported} />
          </View>
        </View>

        {/* Import & export */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import & export</Text>
          <Text style={styles.cardHint}>Import a CSV/JSON call log, or export your data.</Text>
          <View style={styles.buttonRow}>
            <Button label="Import" icon="download" variant="subtle" onPress={async () => {
              const file = await pickTextFile();
              if (!file) return;
              const { parseCallImport } = await import('@/lib/import');
              const result = parseCallImport(file.text, file.name);
              if (result.calls.length === 0) {
                setNotice(result.problems[0] ?? 'No calls found.');
                return;
              }
              const { added, duplicates } = importCalls(result.calls);
              const parts = [`Imported ${added} call${added === 1 ? '' : 's'}`];
              if (duplicates > 0) parts.push(`${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped`);
              if (result.invalid > 0) parts.push(`${result.invalid} row${result.invalid === 1 ? '' : 's'} skipped`);
              setNotice(parts.join(' · '));
            }} />
            <Button label="CSV" icon="file-spreadsheet" variant="subtle" onPress={() => handleExport('csv')} />
            <Button label="JSON" icon="device-floppy" variant="subtle" onPress={() => handleExport('json')} />
            <Button label="XLS" icon="file-spreadsheet" variant="subtle" onPress={() => handleExport('xls')} />
          </View>
        </View>

        {/* Read device call log (native) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device call log</Text>
          <Text style={styles.cardHint}>
            Read calls straight from the phone (Android). Asks for call-log and
            contacts permission on first use.
          </Text>
          <Button
            label={readingNative ? 'Reading…' : 'Read device call log'}
            icon="phone-call"
            variant="primary"
            onPress={handleReadDeviceCalls}
            disabled={readingNative}
          />
        </View>

        {/* Auto-export schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Auto-export schedule</Text>
          <Text style={styles.cardHint}>Automatically export your call log on a schedule.</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingBody}>
              <Text style={styles.settingLabel}>Weekly export</Text>
              <Text style={styles.settingHint}>Export once a week.</Text>
            </View>
            <Switch
              value={settings.autoExportWeekly}
              onValueChange={(value) => persistSettings({ ...settings, autoExportWeekly: value })}
              trackColor={{ false: Colors.border, true: Colors.accentSoft }}
              thumbColor={settings.autoExportWeekly ? Colors.accent : Colors.textMuted}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingBody}>
              <Text style={styles.settingLabel}>Monthly export</Text>
              <Text style={styles.settingHint}>Export at month end.</Text>
            </View>
            <Switch
              value={settings.autoExportMonthly}
              onValueChange={(value) => persistSettings({ ...settings, autoExportMonthly: value })}
              trackColor={{ false: Colors.border, true: Colors.accentSoft }}
              thumbColor={settings.autoExportMonthly ? Colors.accent : Colors.textMuted}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingBody}>
              <Text style={styles.settingLabel}>Format</Text>
              <Text style={styles.settingHint}>{settings.autoExportFormat.toUpperCase()}</Text>
            </View>
            <View style={styles.buttonRow}>
              <Button
                label="CSV"
                variant={settings.autoExportFormat === 'csv' ? 'primary' : 'subtle'}
                compact
                onPress={() => persistSettings({ ...settings, autoExportFormat: 'csv' })}
              />
              <Button
                label="JSON"
                variant={settings.autoExportFormat === 'json' ? 'primary' : 'subtle'}
                compact
                onPress={() => persistSettings({ ...settings, autoExportFormat: 'json' })}
              />
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last auto-export</Text>
            <Text style={styles.statusValue}>
              {lastAutoExportAt ? new Date(lastAutoExportAt).toLocaleString() : 'Never'}
            </Text>
          </View>
          <Button label="Run scheduled export now" icon="download" variant="subtle" onPress={() => runAutoExport('weekly')} />
        </View>

        {/* Settings toggles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingBody}>
              <Text style={styles.settingLabel}>Weekly backup schedule</Text>
              <Text style={styles.settingHint}>Back up automatically once a week.</Text>
            </View>
            <Switch
              value={settings.weeklySchedule}
              onValueChange={(value) => persistSettings({ ...settings, weeklySchedule: value })}
              trackColor={{ false: Colors.border, true: Colors.accentSoft }}
              thumbColor={settings.weeklySchedule ? Colors.accent : Colors.textMuted}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingBody}>
              <Text style={styles.settingLabel}>Wi-Fi only</Text>
              <Text style={styles.settingHint}>Only back up on Wi-Fi (saves mobile data).</Text>
            </View>
            <Switch
              value={settings.wifiOnly}
              onValueChange={(value) => persistSettings({ ...settings, wifiOnly: value })}
              trackColor={{ false: Colors.border, true: Colors.accentSoft }}
              thumbColor={settings.wifiOnly ? Colors.accent : Colors.textMuted}
            />
          </View>
        </View>

        {calls.length === 0 && (
          <EmptyState
            icon="cloud-upload"
            title="Nothing here yet"
            message="Import some calls to get started."
          />
        )}
      </ScrollView>

      {notice !== null && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 24, gap: 12 },
  freeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freeText: { color: Colors.success, fontSize: 13, fontWeight: '600', flex: 1 },
  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  cardHint: { color: Colors.textSecondary, fontSize: 13 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 15,
  },
  hint: { color: Colors.textMuted, fontSize: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { color: Colors.textSecondary, fontSize: 13 },
  statusValue: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  driveRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4 },
  driveBody: { flex: 1, gap: 2 },
  driveTitle: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  driveHint: { color: Colors.textMuted, fontSize: 12 },
  driveError: { color: Colors.danger, fontSize: 11 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 4 },
  settingBody: { flex: 1, gap: 2 },
  settingLabel: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  settingHint: { color: Colors.textMuted, fontSize: 12 },
  notice: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  noticeText: { color: Colors.text, fontSize: 14, fontWeight: '500', textAlign: 'center' },
});