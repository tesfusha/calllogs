import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { TablerIcon, type TablerIconName } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';
import { avatarColor, formatDateTime, formatDuration, initials } from '@/lib/format';
import type { CallPatch } from '@/store/CallsProvider';
import type { CallDirection, CallRecord } from '@/types/call';

type CallDetailModalProps = {
  /** `null` closes the sheet. */
  call: CallRecord | null;
  onClose: () => void;
  onSave: (patch: CallPatch) => void;
  onDelete: () => void;
  onCallBack: () => void;
};

const DIRECTION_META: Record<
  CallDirection,
  { label: string; icon: TablerIconName; color: string }
> = {
  incoming: { label: 'Incoming', icon: 'phone-incoming', color: Colors.incoming },
  outgoing: { label: 'Outgoing', icon: 'phone-outgoing', color: Colors.outgoing },
  missed: { label: 'Missed', icon: 'phone-incoming', color: Colors.missed },
};

/**
 * Detail sheet for one call: read-only facts on top, editable note/tag below.
 * Opened from a history row, dismissed by the backdrop, the X, or Escape.
 */
export function CallDetailModal({
  call,
  onClose,
  onSave,
  onDelete,
  onCallBack,
}: CallDetailModalProps) {
  if (!call) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close call details">
        {/* A nested responder stops taps on the sheet from reaching the backdrop. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Keyed remount: each call gets freshly seeded note/tag editors. */}
          <Sheet
            call={call}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
            onCallBack={onCallBack}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Sheet({
  call,
  onClose,
  onSave,
  onDelete,
  onCallBack,
}: CallDetailModalProps & { call: CallRecord }) {
  const [note, setNote] = useState(call.note ?? '');
  const [tag, setTag] = useState(call.tag ?? '');

  const meta = DIRECTION_META[call.direction];
  const title = call.name?.trim() || call.number;

  const save = () => {
    onSave({
      note: note.trim() === '' ? null : note.trim(),
      tag: tag.trim() === '' ? null : tag.trim(),
    });
    onClose();
  };

  return (
    <>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(call.number) }]}>
          <Text style={styles.initials}>{initials(call.name, call.number)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.subtitleRow}>
            <TablerIcon name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.subtitle, { color: meta.color }]}>{meta.label}</Text>
            <Text style={styles.subtitleMuted}>·</Text>
            <Text style={styles.subtitleMuted}>{formatDateTime(call.timestamp)}</Text>
          </View>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={styles.close}>
          <TablerIcon name="x" size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.facts}>
        <Fact label="Number" value={call.number} />
        <Fact label="Duration" value={formatDuration(call.duration)} />
        <Fact label="SIM" value={call.sim ?? '—'} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Note</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note about this call"
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
          accessibilityLabel="Call note"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Tag</Text>
        <TextInput
          style={styles.input}
          value={tag}
          onChangeText={setTag}
          placeholder="e.g. Family, Work, Doctor"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          maxLength={40}
          accessibilityLabel="Call tag"
        />
      </View>

      <Button label="Call back" icon="phone" variant="primary" onPress={onCallBack} />

      <View style={styles.actions}>
        <Button
          label="Delete"
          icon="trash"
          variant="danger"
          style={styles.actionGrow}
          onPress={onDelete}
        />
        <Button
          label="Save"
          icon="check"
          variant="primary"
          style={styles.actionGrow}
          onPress={save}
        />
      </View>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
    maxWidth: 440,
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
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtitleMuted: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  facts: {
    flexDirection: 'row',
    gap: 8,
  },
  fact: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 3,
  },
  factLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  factValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
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
  inputMultiline: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionGrow: {
    flex: 1,
  },
});
