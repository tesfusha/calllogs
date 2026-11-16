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
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useCalls } from '@/store/CallsProvider';

const SETTINGS_KEY = 'calllog.backupSettings.v1';
const PROFILE_KEY = 'calllog.profile.v1';

type BackupSettings = {
  weeklySchedule: boolean;
  wifiOnly: boolean;
};

const DEFAULT_SETTINGS: BackupSettings = {
  weeklySchedule: false,
  wifiOnly: true,
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
  const [notice, setNotice] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

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