import { StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

import { Colors } from '@/constants/Colors';

export type PieSlice = {
  label: string;
  value: number;
  color: string;
};

type PieChartProps = {
  slices: PieSlice[];
  size?: number;
  /** Text shown in the centre of the donut. */
  centerLabel?: string;
  centerValue?: string;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Donut chart built with SVG arcs. Slices with value 0 are skipped. */
export function PieChart({ slices, size = 160, centerLabel, centerValue }: PieChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = size / 2;
  const inner = radius * 0.62;
  const cx = radius;
  const cy = radius;

  const segments: { path: string; color: string; label: string; value: number }[] = [];
  let startAngle = -90;

  slices.forEach((slice) => {
    if (slice.value <= 0 || total <= 0) return;
    const angle = (slice.value / total) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;

    const start = {
      x: cx + radius * Math.cos(toRadians(startAngle)),
      y: cy + radius * Math.sin(toRadians(startAngle)),
    };
    const end = {
      x: cx + radius * Math.cos(toRadians(endAngle)),
      y: cy + radius * Math.sin(toRadians(endAngle)),
    };
    const innerStart = {
      x: cx + inner * Math.cos(toRadians(endAngle)),
      y: cy + inner * Math.sin(toRadians(endAngle)),
    };
    const innerEnd = {
      x: cx + inner * Math.cos(toRadians(startAngle)),
      y: cy + inner * Math.sin(toRadians(startAngle)),
    };

    const path = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${inner} ${inner} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z',
    ].join(' ');

    segments.push({ path, color: slice.color, label: slice.label, value: slice.value });
    startAngle = endAngle;
  });

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((segment, index) => (
            <Path key={`${segment.label}-${index}`} d={segment.path} fill={segment.color} />
          ))}
        </G>
        {centerValue !== undefined && (
          <SvgText
            x={cx}
            y={cy - 4}
            fill={Colors.text}
            fontSize={20}
            fontWeight="700"
            textAnchor="middle">
            {centerValue}
          </SvgText>
        )}
        {centerLabel !== undefined && (
          <SvgText
            x={cx}
            y={cy + 14}
            fill={Colors.textMuted}
            fontSize={11}
            fontWeight="600"
            textAnchor="middle">
            {centerLabel}
          </SvgText>
        )}
      </Svg>

      <View style={styles.legend}>
        {slices
          .filter((slice) => slice.value > 0)
          .map((slice) => (
            <View key={slice.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: slice.color }]} />
              <Text style={styles.legendLabel}>{slice.label}</Text>
              <Text style={styles.legendValue}>
                {slice.value} ({total > 0 ? Math.round((slice.value / total) * 100) : 0}%)
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12,
  },
  legend: {
    alignSelf: 'stretch',
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  legendValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});