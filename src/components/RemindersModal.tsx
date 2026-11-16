import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TablerIcon } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';
import { formatDuration } from '@/lib/format';
import { useReminders } from '@/store/RemindersProvider';

type RemindersModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RemindersModal({ open, onClose }: RemindersModalProps) {
  const {
    permission,
    quiet,
    weeklyReport,
    monthlyReport,
    lastRunAt,
    runCheck,
    generateWeekly,
    generateMonthly,
    requestPermission,
  } = useReminders();

  if (!open) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close reminders">
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Reminders & reports</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} style={styles.close}>
              <TablerIcon name="x" size={18} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <Text style={styles.body}>
                Permission: {permission}. {permission === 'granted' ? 'Enabled.' : 'Enable to get "been a while" nudges.'}
              </Text>
              {permission !== 'granted' && permission !== 'unsupported' && (
                <Button label="Enable notifications" icon="bell" variant="primary" onPress={requestPermission} />
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quiet contacts</Text>
                <Button label="Run check" icon="refresh" variant="subtle" compact onPress={runCheck} />
              </View>
              {quiet.length === 0 ? (
                <Text style={styles.body}>No one has gone quiet — nice.</Text>
              ) : (
                quiet.map((contact) => (
                  <View key={contact.number} style={styles.quietRow}>
                    <TablerIcon name="bell-ringing" size={18} color={Colors.warning} />
                    <View style={styles.quietBody}>
                      <Text style={styles.quietName}>{contact.name}</Text>
                      <Text style={styles.quietMsg}>
                        It&apos;s been {contact.daysSinceLast} day{contact.daysSinceLast === 1 ? '' : 's'} (usually every {contact.typicalIntervalDays}).
                      </Text>
                    </View>
                  </View>
                ))
              )}
              {lastRunAt !== null && (
                <Text style={styles.meta}>Last checked {new Date(lastRunAt).toLocaleString()}</Text>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Weekly report</Text>
                <Button label="Generate" icon="report-analytics" variant="subtle" compact onPress={generateWeekly} />
              </View>
              {weeklyReport ? (
                <View style={styles.report}>
                  <Text style={styles.reportLabel}>{weeklyReport.label}</Text>
                  <Text style={styles.reportLine}>
                    {weeklyReport.totalCalls} calls · {formatDuration(weeklyReport.totalDuration)}
                  </Text>
                  <Text style={styles.reportLine}>
                    Incoming {weeklyReport.incoming} · Outgoing {weeklyReport.outgoing} · Missed {weeklyReport.missed}
                  </Text>
                  {weeklyReport.topContact && (
                    <Text style={styles.reportLine}>Top: {weeklyReport.topContact.name} ({weeklyReport.topContact.count} calls)</Text>
                  )}
                  {weeklyReport.busiestDay && <Text style={styles.reportLine}>Busiest: {weeklyReport.busiestDay}</Text>}
                </View>
              ) : (
                <Text style={styles.body}>No weekly report yet. Generate one or wait for Sunday.</Text>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Monthly report</Text>
                <Button label="Generate" icon="calendar-month" variant="subtle" compact onPress={generateMonthly} />
              </View>
              {monthlyReport ? (
                <View style={styles.report}>
                  <Text style={styles.reportLabel}>{monthlyReport.label}</Text>
                  <Text style={styles.reportLine}>
                    {monthlyReport.totalCalls} calls · {formatDuration(monthlyReport.totalDuration)}
                  </Text>
                  <Text style={styles.reportLine}>
                    Incoming {monthlyReport.incoming} · Outgoing {monthlyReport.outgoing} · Missed {monthlyReport.missed}
                  </Text>
                  {monthlyReport.topContact && (
                    <Text style={styles.reportLine}>Top: {monthlyReport.topContact.name} ({monthlyReport.topContact.count} calls)</Text>
                  )}
                  {monthlyReport.busiestDay && <Text style={styles.reportLine}>Busiest: {monthlyReport.busiestDay}</Text>}
                </View>
              ) : (
                <Text style={styles.body}>No monthly report yet. Generate one or wait for month end.</Text>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '85%',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingBottom: 8,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  quietRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  quietBody: {
    flex: 1,
    gap: 2,
  },
  quietName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  quietMsg: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  report: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  reportLabel: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  reportLine: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});