import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, STATUS_LABELS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { applicationStatusOrder, currentApplicant } from '@/data/mockData';

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const application = currentApplicant.applications.find((item) => item.id === id) || currentApplicant.applications[0];
  const currentIndex = applicationStatusOrder.indexOf(application.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>{application.propertyAddress}</Text>
          <Text style={styles.heroText}>{application.agencyName} • Managed by {application.agentName}</Text>
          <Badge status={application.status} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Status journey</Text>
          {applicationStatusOrder.map((status, index) => {
            const active = index <= currentIndex && currentIndex !== -1;
            return (
              <View key={status} style={styles.timelineRow}>
                <Ionicons color={active ? Colors.accent.gold : Colors.text.muted} name={active ? 'checkmark-circle' : 'ellipse-outline'} size={18} />
                <Text style={[styles.timelineText, { color: active ? Colors.text.primary : Colors.text.secondary }]}>{STATUS_LABELS[status]}</Text>
              </View>
            );
          })}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Application details</Text>
          <Detail label="Reference" value={application.propertyRef || 'Not provided'} />
          <Detail label="Submitted" value={application.submittedAt || 'Saved as draft'} />
          <Detail label="Last updated" value={application.updatedAt} />
          <Detail label="Monthly rent" value={application.monthlyRent ? `£${application.monthlyRent.toLocaleString()} pcm` : 'Not set'} />
          <Detail label="Your notes" value={application.notes || 'No notes added'} />
          <Detail label="Agent notes" value={application.agentNotes || 'No updates yet'} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Passport snapshot</Text>
          <Detail label="Applicant" value={currentApplicant.passport.fullName} />
          <Detail label="Employment" value={`${currentApplicant.passport.jobTitle} at ${currentApplicant.passport.employer}`} />
          <Detail label="Monthly budget" value={`£${currentApplicant.passport.monthlyBudget?.toLocaleString()} pcm`} />
          <Detail label="References" value={currentApplicant.passport.hasReferences ? 'Ready to share' : 'Still outstanding'} />
        </Card>

        <View style={styles.actions}>
          <Button title="Back to applications" onPress={() => router.replace('/(applicant)/applications')} />
          <Button title="Open my passport" onPress={() => router.push('/(applicant)/passport')} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background.primary,
    flex: 1,
  },
  container: {
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  heroCard: {
    gap: Spacing.md,
  },
  heroTitle: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  heroText: {
    color: '#4D453D',
    fontSize: Typography.sizes.md,
  },
  sectionCard: {
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  timelineRow: {
    alignItems: 'center',
    borderTopColor: Colors.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  timelineText: {
    fontSize: Typography.sizes.md,
  },
  detailRow: {
    borderTopColor: Colors.border.subtle,
    borderTopWidth: 1,
    gap: Spacing.xs,
    paddingTop: Spacing.md,
  },
  detailLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  detailValue: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.md,
  },
});
