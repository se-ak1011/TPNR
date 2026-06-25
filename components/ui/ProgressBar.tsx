import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const progress = total === 0 ? 0 : Math.min(current / total, 1);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>{label || 'Progress'}</Text>
        <Text style={styles.value}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  value: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  track: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.full,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: Colors.accent.gold,
    borderRadius: BorderRadius.full,
    height: '100%',
  },
});
