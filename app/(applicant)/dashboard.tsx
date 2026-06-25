import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentApplicant } from '@/data/mockData';

const currency = (value?: number) => (value ? `£${value.toLocaleString()}` : '—');

export default function ApplicantDashboardScreen() {
  const router = useRouter();
  const documents = Object.values(currentApplicant.passport.documents);
  const completeDocs = documents.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.name}>{currentApplicant.passport.fullName}</Text>
          </View>
          <Badge label={currentApplicant.passport.isComplete ? 'Passport ready' : 'Finish onboarding'} color={currentApplicant.passport.isComplete ? Colors.success : Colors.accent.gold} />
        </View>

        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>Your profile is working hard for you.</Text>
          <Text style={styles.heroText}>
            Share one polished renter passport with every application and keep momentum across multiple properties.
          </Text>
          <View style={styles.heroStatsRow}>
            <View>
              <Text style={styles.heroStat}>{currentApplicant.applications.length}</Text>
              <Text style={styles.heroLabel}>Live applications</Text>
            </View>
            <View>
              <Text style={styles.heroStat}>{currency(currentApplicant.passport.monthlyBudget)}</Text>
              <Text style={styles.heroLabel}>Monthly budget</Text>
            </View>
          </View>
        </Card>

        <View style={styles.grid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{currentApplicant.applications.filter((item) => item.status === 'submitted').length}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{currentApplicant.applications.filter((item) => item.status === 'viewing_invited').length}</Text>
            <Text style={styles.statLabel}>Viewing invites</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{currentApplicant.passport.desiredMoveInDate}</Text>
            <Text style={styles.statLabel}>Preferred move date</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{currentApplicant.passport.employmentStatus.replace('_', ' ')}</Text>
            <Text style={styles.statLabel}>Employment</Text>
          </Card>
        </View>

        <View style={styles.actions}>
          <Button title="Continue onboarding" onPress={() => router.push('/(applicant)/onboarding')} />
          <Button title="Start a new application" onPress={() => router.push('/(applicant)/applications/new')} variant="secondary" />
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Passport health</Text>
            <Ionicons color={Colors.accent.gold} name="sparkles-outline" size={18} />
          </View>
          <ProgressBar current={completeDocs} label="Documents uploaded" total={documents.length} />
          <Text style={styles.sectionText}>
            Your strongest signals right now are verified identity, proof of address, and employment documents.
          </Text>
          <Button fullWidth={false} title="Open passport" onPress={() => router.push('/(applicant)/passport')} variant="ghost" />
        </Card>

        <View style={styles.sectionHeaderStandalone}>
          <Text style={styles.sectionTitle}>Recent applications</Text>
          <Button fullWidth={false} title="View all" onPress={() => router.push('/(applicant)/applications')} variant="ghost" />
        </View>

        {currentApplicant.applications.map((application) => (
          <Pressable key={application.id} onPress={() => router.push(`/(applicant)/applications/${application.id}`)}>
            <Card style={styles.applicationCard}>
              <View style={styles.applicationRow}>
                <View style={styles.applicationMeta}>
                  <Text style={styles.applicationAddress}>{application.propertyAddress}</Text>
                  <Text style={styles.applicationSubtext}>{application.agencyName} • Updated {application.updatedAt}</Text>
                </View>
                <Ionicons color={Colors.text.secondary} name="chevron-forward" size={18} />
              </View>
              <View style={styles.applicationFooter}>
                <Badge status={application.status} />
                <Text style={styles.applicationRent}>{currency(application.monthlyRent)} pcm</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  greeting: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  name: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
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
    color: '#3F372F',
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStat: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  heroLabel: {
    color: '#4D453D',
    fontSize: Typography.sizes.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    gap: Spacing.xs,
    width: '47.5%',
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  statLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    textTransform: 'capitalize',
  },
  actions: {
    gap: Spacing.md,
  },
  sectionCard: {
    gap: Spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeaderStandalone: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
  },
  sectionText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  applicationCard: {
    gap: Spacing.md,
  },
  applicationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  applicationMeta: {
    flex: 1,
    gap: 4,
  },
  applicationAddress: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  applicationSubtext: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  applicationFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applicationRent: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
