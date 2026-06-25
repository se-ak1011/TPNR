import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, STATUS_LABELS } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { applicants, applicationStatusOrder } from '@/data/mockData';
import { ApplicationStatus } from '@/types';

export default function ApplicantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const applicant = applicants.find((item) => item.id === id) || applicants[0];
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(applicant.applications[0]?.status || 'submitted');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.name}>{applicant.passport.fullName}</Text>
          <Text style={styles.heroText}>{applicant.passport.jobTitle} • {applicant.passport.employer}</Text>
          <Badge status={selectedStatus} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Status controls</Text>
          <View style={styles.statusWrap}>
            {applicationStatusOrder.map((status) => (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={[styles.statusPill, selectedStatus === status && styles.statusPillSelected]}>
                <Text style={[styles.statusText, selectedStatus === status && styles.statusTextSelected]}>{STATUS_LABELS[status]}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact & affordability</Text>
          <Detail label="Email" value={applicant.passport.email} />
          <Detail label="Phone" value={applicant.passport.phone} />
          <Detail label="Current address" value={applicant.passport.currentAddress} />
          <Detail label="Income" value={`£${applicant.passport.annualIncome?.toLocaleString()} per year`} />
          <Detail label="Budget" value={`£${applicant.passport.monthlyBudget?.toLocaleString()} pcm`} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tenant profile</Text>
          <Detail label="Pets" value={applicant.passport.hasPets ? applicant.passport.petDetails || 'Yes' : 'No pets'} />
          <Detail label="Smoking" value={applicant.passport.smokingStatus.replace('_', ' ')} />
          <Detail label="Right to Rent" value={applicant.passport.rightToRent.replace('_', ' ')} />
          <Detail label="References" value={applicant.passport.hasReferences ? applicant.passport.referenceDetails || 'Available' : 'Pending'} />
          <Detail label="Notes" value={applicant.passport.notesForAgent || 'No additional notes'} />
        </Card>
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
  name: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xxxl,
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
  statusWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusPill: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  statusPillSelected: {
    backgroundColor: `${Colors.accent.olive}22`,
    borderColor: Colors.accent.olive,
  },
  statusText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  statusTextSelected: {
    color: Colors.text.primary,
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
});
