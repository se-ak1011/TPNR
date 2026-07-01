import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentApplicant } from '@/data/mockData';

const documents = [
  { key: 'photoId', label: 'Photo ID' },
  { key: 'proofOfAddress', label: 'Proof of address' },
  { key: 'bankStatements', label: 'Bank statements' },
  { key: 'employmentContract', label: 'Employment contract' },
  { key: 'payslips', label: 'Payslips' },
  { key: 'references', label: 'References' },
] as const;

const money = (value?: number) => (value ? `£${value.toLocaleString()}` : '—');

const EMPLOYMENT_LABELS: Record<string, string> = {
  employed: 'Employed',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  student: 'Student',
  retired: 'Retired',
};

const SMOKING_LABELS: Record<string, string> = {
  non_smoker: 'Non-smoker',
  smoker: 'Smoker',
  outdoor_only: 'Outdoor only',
};

const RIGHT_TO_RENT_LABELS: Record<string, string> = {
  uk_citizen: 'UK Citizen',
  eu_settled: 'EU Settled Status',
  visa: 'Visa holder',
  other: 'Other',
};

export default function PassportScreen() {
  const passport = currentApplicant.passport;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Passport</Text>
          <Badge label={passport.isComplete ? 'Ready to share' : 'Needs updates'} color={passport.isComplete ? Colors.success : Colors.accent.gold} />
        </View>

        <Card tone="warm" style={styles.summaryCard}>
          <Text style={styles.summaryName}>{passport.fullName}</Text>
          <Text style={styles.summaryText}>{passport.notesForAgent}</Text>
          <View style={styles.summaryStats}>
            <Text style={styles.summaryStat}>{money(passport.annualIncome)} income</Text>
            <Text style={styles.summaryStat}>{money(passport.monthlyBudget)} budget</Text>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal details</Text>
          <Detail label="Email" value={passport.email} />
          <Detail label="Phone" value={passport.phone} />
          <Detail label="Current address" value={passport.currentAddress} />
          <Detail label="Desired move-in date" value={passport.desiredMoveInDate} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Employment & affordability</Text>
          <Detail label="Employment status" value={EMPLOYMENT_LABELS[passport.employmentStatus] ?? passport.employmentStatus} />
          <Detail label="Employer" value={passport.employer || 'Not provided'} />
          <Detail label="Job title" value={passport.jobTitle || 'Not provided'} />
          <Detail label="Annual income" value={money(passport.annualIncome)} />
          <Detail label="Monthly budget" value={money(passport.monthlyBudget)} />
          <Detail label="Guarantor" value={passport.hasGuarantor ? `${passport.guarantorName} • ${passport.guarantorRelationship}` : 'Not required'} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Lifestyle & references</Text>
          <Detail label="Pets" value={passport.hasPets ? passport.petDetails || 'Yes' : 'No pets'} />
          <Detail label="Children / dependants" value={passport.hasChildren ? `${passport.numberOfDependants || 0} dependant(s)` : 'None'} />
          <Detail label="Smoking" value={SMOKING_LABELS[passport.smokingStatus] ?? passport.smokingStatus} />
          <Detail label="Right to Rent" value={RIGHT_TO_RENT_LABELS[passport.rightToRent] ?? passport.rightToRent} />
          <Detail label="References" value={passport.hasReferences ? passport.referenceDetails || 'Available' : 'Not yet added'} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Documents checklist</Text>
          {documents.map((document) => {
            const complete = passport.documents[document.key];
            return (
              <View key={document.key} style={styles.documentRow}>
                <View style={styles.documentLeft}>
                  <Ionicons color={complete ? Colors.success : Colors.text.muted} name={complete ? 'checkmark-circle' : 'ellipse-outline'} size={18} />
                  <Text style={styles.documentText}>{document.label}</Text>
                </View>
                <Text style={[styles.documentStatus, { color: complete ? Colors.success : Colors.text.secondary }]}>
                  {complete ? 'Uploaded' : 'Missing'}
                </Text>
              </View>
            );
          })}
        </Card>

        <Button title="Refresh onboarding answers" onPress={() => undefined} variant="secondary" />
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
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  summaryCard: {
    gap: Spacing.md,
  },
  summaryName: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  summaryText: {
    color: '#4D453D',
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryStat: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  sectionCard: {
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
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
  documentRow: {
    alignItems: 'center',
    borderTopColor: Colors.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  documentLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  documentText: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.md,
  },
  documentStatus: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
