import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentApplicant, currentTenancy, movingChecklist } from '@/data/mockData';

const currency = (value?: number) => (value ? `£${value.toLocaleString()}` : '—');

type JourneySection = {
  icon: string;
  label: string;
  sublabel: string;
  route: string;
  accent?: string;
};

export default function DashboardScreen() {
  const router = useRouter();
  const documents = Object.values(currentApplicant.passport.documents);
  const completeDocs = documents.filter(Boolean).length;
  const openMaintenance = currentTenancy.maintenanceRequests.filter((r) => r.status !== 'resolved' && r.status !== 'closed');
  const urgentMaintenance = openMaintenance.filter((r) => r.priority === 'high' || r.priority === 'emergency');
  const checklistDone = movingChecklist.filter((i) => i.completed).length;

  const journeySections: JourneySection[] = [
    {
      icon: 'id-card-outline',
      label: 'My Passport',
      sublabel: currentApplicant.passport.isComplete
        ? `${currentApplicant.applications.length} active applications`
        : 'Finish your profile to apply',
      route: '/(applicant)/passport',
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'My Home',
      sublabel:
        openMaintenance.length > 0
          ? `${openMaintenance.length} open request${openMaintenance.length > 1 ? 's' : ''}${urgentMaintenance.length > 0 ? ` · ${urgentMaintenance.length} urgent` : ''}`
          : 'All requests resolved',
      route: '/(applicant)/my-home',
      accent: urgentMaintenance.length > 0 ? Colors.error : undefined,
    },
    {
      icon: 'checkbox-outline',
      label: 'Moving',
      sublabel: `${checklistDone} of ${movingChecklist.length} checklist items done · £${currentTenancy.depositInfo.amount.toLocaleString()} held in ${currentTenancy.depositInfo.scheme}`,
      route: '/(applicant)/moving',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>{currentApplicant.passport.fullName}</Text>
          </View>
          <Badge
            label={currentApplicant.passport.isComplete ? 'Passport ready' : 'Finish onboarding'}
            color={currentApplicant.passport.isComplete ? Colors.success : Colors.accent.gold}
          />
        </View>

        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>Your full renting journey, in one place.</Text>
          <Text style={styles.heroText}>
            Passport to move-in to move-out — everything you need to rent with confidence.
          </Text>
          <View style={styles.heroStatsRow}>
            <View>
              <Text style={styles.heroStat}>{currentApplicant.applications.length}</Text>
              <Text style={styles.heroLabel}>Applications</Text>
            </View>
            <View>
              <Text style={styles.heroStat}>{currency(currentApplicant.passport.monthlyBudget)}</Text>
              <Text style={styles.heroLabel}>Monthly budget</Text>
            </View>
            <View>
              <Text style={styles.heroStat}>{currentTenancy.inventoryItems.length}</Text>
              <Text style={styles.heroLabel}>Items documented</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Your journey</Text>

        {journeySections.map((section) => (
          <Pressable key={section.label} onPress={() => router.push(section.route as any)}>
            <Card style={styles.journeyCard}>
              <View style={styles.journeyRow}>
                <View style={[styles.journeyIconWrap, section.accent ? { borderColor: section.accent } : {}]}>
                  <Ionicons
                    color={section.accent ?? Colors.accent.gold}
                    name={section.icon as any}
                    size={22}
                  />
                </View>
                <View style={styles.journeyContent}>
                  <Text style={styles.journeyLabel}>{section.label}</Text>
                  <Text style={[styles.journeySublabel, section.accent ? { color: section.accent } : {}]}>
                    {section.sublabel}
                  </Text>
                </View>
                <Ionicons color={Colors.text.muted} name="chevron-forward" size={18} />
              </View>
            </Card>
          </Pressable>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Passport health</Text>
          <Ionicons color={Colors.accent.gold} name="sparkles-outline" size={18} />
        </View>
        <Card style={styles.passportCard}>
          <ProgressBar current={completeDocs} label="Documents uploaded" total={documents.length} />
          <Text style={styles.passportText}>
            Your strongest signals right now: verified identity, proof of address, and employment documents.
          </Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent applications</Text>
          <Pressable onPress={() => router.push('/(applicant)/applications')}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        {currentApplicant.applications.map((application) => (
          <Pressable key={application.id} onPress={() => router.push(`/(applicant)/applications/${application.id}` as any)}>
            <Card style={styles.appCard}>
              <View style={styles.appRow}>
                <View style={styles.appMeta}>
                  <Text style={styles.appAddress}>{application.propertyAddress}</Text>
                  <Text style={styles.appSubtext}>
                    {application.agencyName} · Updated {application.updatedAt}
                  </Text>
                </View>
                <Ionicons color={Colors.text.secondary} name="chevron-forward" size={18} />
              </View>
              <View style={styles.appFooter}>
                <Badge status={application.status} />
                <Text style={styles.appRent}>{currency(application.monthlyRent)} pcm</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  greeting: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  name: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  heroCard: { gap: Spacing.md },
  heroTitle: { color: Colors.text.inverse, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  heroText: { color: '#3F372F', fontSize: Typography.sizes.md, lineHeight: 22 },
  heroStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heroStat: { color: Colors.text.inverse, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  heroLabel: { color: '#4D453D', fontSize: Typography.sizes.sm },
  sectionTitle: { color: Colors.text.primary, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.semibold },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  viewAll: { color: Colors.accent.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  journeyCard: { gap: Spacing.sm },
  journeyRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  journeyIconWrap: {
    alignItems: 'center',
    borderColor: Colors.border.accent,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  journeyContent: { flex: 1, gap: 3 },
  journeyLabel: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  journeySublabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  passportCard: { gap: Spacing.md },
  passportText: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  appCard: { gap: Spacing.md },
  appRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  appMeta: { flex: 1, gap: 4 },
  appAddress: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  appSubtext: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  appFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  appRent: { color: Colors.text.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
});
