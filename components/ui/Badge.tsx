import { StyleSheet, Text, View } from 'react-native';
import { ApplicationStatus } from '@/types';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  viewed: 'Viewed',
  shortlisted: 'Shortlisted',
  viewing_invited: 'Viewing Invited',
  not_selected: 'Not Selected',
  accepted: 'Accepted',
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: Colors.status.draft,
  submitted: Colors.status.submitted,
  viewed: Colors.status.viewed,
  shortlisted: Colors.status.shortlisted,
  viewing_invited: Colors.status.viewingInvited,
  not_selected: Colors.status.notSelected,
  accepted: Colors.status.accepted,
};

interface BadgeProps {
  status?: ApplicationStatus;
  label?: string;
  color?: string;
}

export function Badge({ status, label, color }: BadgeProps) {
  const badgeColor = status ? STATUS_COLORS[status] : color || Colors.accent.gold;
  const badgeLabel = status ? STATUS_LABELS[status] : label || 'Label';

  return (
    <View style={[styles.badge, { backgroundColor: `${badgeColor}22`, borderColor: `${badgeColor}55` }]}>
      <Text style={[styles.text, { color: badgeColor }]}>{badgeLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  text: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
