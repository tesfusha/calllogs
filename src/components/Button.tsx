import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { TablerIcon, type TablerIconName } from '@/components/TablerIcons';
import { Colors } from '@/constants/Colors';

type Variant = 'primary' | 'subtle' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: TablerIconName;
  disabled?: boolean;
  /** Smaller padding for buttons that sit in a header or a toolbar row. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const PALETTES: Record<Variant, { background: string; foreground: string; border: string }> = {
  primary: {
    background: Colors.accent,
    foreground: Colors.bg,
    border: Colors.accent,
  },
  subtle: {
    background: Colors.surfaceElevated,
    foreground: Colors.text,
    border: Colors.border,
  },
  danger: {
    background: Colors.surfaceElevated,
    foreground: Colors.danger,
    border: Colors.border,
  },
};

/**
 * The one button in the app. Three variants are enough for a dark UI where
 * emphasis comes from the accent fill rather than from size or shadow.
 */
export function Button({
  label,
  onPress,
  variant = 'subtle',
  icon,
  disabled = false,
  compact = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const palette = PALETTES[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {icon !== undefined && (
        <TablerIcon name={icon} size={compact ? 16 : 18} color={palette.foreground} />
      )}
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          { color: palette.foreground },
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  compact: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 14,
  },
});
