import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TablerIcon, type TablerIconName } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';
import { avatarColor, formatDuration, formatTime, initials } from '@/lib/format';
import type { CallDirection, CallRecord } from '@/types/call';

type CallRowProps = {
  call: CallRecord;
  /** Opens the detail sheet (note/tag editing). */
  onPress: () => void;
  /** Places the call-back. */
  onCallBack: () => void;
};

const DIRECTION_META: Record<
  CallDirection,
  { label: string; icon: TablerIconName; color: string }
> = {
  incoming: { label: 'Incoming', icon: 'phone-incoming', color: Colors.incoming },
  outgoing: { label: 'Outgoing', icon: 'phone-outgoing', color: Colors.outgoing },
  // Missed calls are unanswered incoming calls: same arrow, alarm colour.
  missed: { label: 'Missed', icon: 'phone-incoming', color: Colors.missed },
};

/** One entry in the date-grouped history: avatar, direction, SIM, time, call-back. */
export function CallRow({ call, onPress, onCallBack }: CallRowProps) {
  const meta = DIRECTION_META[call.direction];
  const title = call.name?.trim() || call.number;
  const showDuration = call.duration > 0 && call.direction !== 'missed';

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${meta.label}${
          showDuration ? `, ${formatDuration(call.duration)}` : ''
        }, ${formatTime(call.timestamp)}`}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(call.number) }]}>
          <Text style={styles.initials}>{initials(call.name, call.number)}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.metaRow}>
            <TablerIcon name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.meta, { color: meta.color }]} numberOfLines={1}>
              {meta.label}
              {showDuration ? ` · ${formatDuration(call.duration)}` : ''}
            </Text>

            {call.sim !== null && <Text style={styles.sim}>{call.sim}</Text>}

            {call.tag !== null && call.tag !== '' && (
              <View style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {call.tag}
                </Text>
              </View>
            )}

            {call.note !== null && call.note !== '' && (
              <TablerIcon
                name="note"
                size={13}
                color={Colors.textMuted}
                accessibilityLabel="Has a note"
              />
            )}
          </View>
        </View>

        <Text style={styles.time}>{formatTime(call.timestamp)}</Text>
      </Pressable>

      <Pressable
        onPress={onCallBack}
        accessibilityRole="button"
        accessibilityLabel={`Call back ${title}`}
        hitSlop={6}
        style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}>
        <TablerIcon name="phone" size={18} color={Colors.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 4,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  sim: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  tag: {
    maxWidth: 96,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
    overflow: 'hidden',
  },
  tagText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 13,
    minWidth: 58,
    textAlign: 'right',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
