import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { fetchApplications, fetchChecklist, fetchPassport, fetchTenancy } from '@/lib/db';
import { CurrentTenancy, MovingChecklistItem, PropertyApplication, TenantPassport } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const currency = (value?: number) => (value ? `£${value.toLocaleString()}` : '—');
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [passport, setPassport] = useState<TenantPassport | null>(null);
  const [applications, setApplications] = useState<PropertyApplication[]>([]);
  const [tenancy, setTenancy] = useState<CurrentTenancy | null>(null);
  const [checklist, setChecklist] = useState<MovingChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchPassport(user.id),
      fetchApplications(user.id),
      fetchTenancy(user.id),
      fetchChecklist(user.id),
    ]).then(([p, apps, t, cl]) => {
      setPassport(p);
      setApplications(apps);
      setTenancy(t);
      setChecklist(cl);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator color={Colors.accent.gold} />
      </View>
    );
  }

  const documents = passport ? Object.values(passport.documents) : [];
  const completeDocs = documents.filter(Boolean).length;
  const openMaintenance = (tenancy?.maintenanceRequests ?? []).filter(
    (r) => r.status !== 'resolved' && r.status !== 'closed',
  );
  const urgentMaintenance = openMaintenance.filter((r) => r.priority === 'high' || r.priority === 'emergency');
  const checklistDone = checklist.filter((i) => i.completed).length;

  const journeySections = [
    {
      icon: 'id-card-outline',
      label: 'My Passport',
      sublabel: passport?.isComplete
        ? `${applications.length} active application${applications.length !== 1 ? 's' : ''}`
        : 'Finish your profile to apply',
      route: '/(applicant)/passport',
      accent: undefined as string | undefined,
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
      sublabel: tenancy
        ? `${checklistDone} of ${checklist.length} checklist items done · £${tenancy.depositInfo.amount.toLocaleString()} held in ${tenancy.depositInfo.scheme}`
        : `${checklistDone} of ${checklist.length} checklist items done`,
      route: '/(applicant)/moving',
      accent: undefined as string | undefined,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{passport?.fullName ?? 'Welcome'}</Text>
          </View>
          <Badge
            label={passport?.isComplete ? 'Passport ready' : 'Finish onboarding'}
            color={passport?.isComplete ? Colors.success : Colors.accent.gold}
          />
        </View>

        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>Your full renting journey, in one place.</Text>
          <Text style={styles.heroText}>
            Passport to move-in to move-out — everything you need to rent with confidence.
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStat}>{applications.length}</Text>
              <Text style={styles.heroLabel}>Applications</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStat}>{currency(passport?.monthlyBudget)}</Text>
              <Text style={styles.heroLabel}>Monthly budget</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStat}>{tenancy?.inventoryItems.length ?? 0}</Text>
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
                  <Ionicons color={section.accent ?? Colors.accent.gold} name={section.icon as any} size={22} />
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

        {passport && (
          <>
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
          </>
        )}

        {applications.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent applications</Text>
              <Pressable onPress={() => router.push('/(applicant)/applications')}>
                <Text style={styles.viewAll}>View all</Text>
              </Pressable>
            </View>

            {applications.slice(0, 3).map((application) => (
              <Pressable
                key={application.id}
                onPress={() => router.push(`/(applicant)/applications/${application.id}` as any)}>
                <Card style={styles.appCard}>
                  <View style={styles.appRow}>
                    <View style={styles.appMeta}>
                      <Text style={styles.appAddress}>{application.propertyAddress}</Text>
                      <Text style={styles.appSubtext}>
                        {application.agencyName} · Updated {fmtDate(application.updatedAt)}
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
          </>
        )}
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
  heroStatsRow: { flexDirection: 'row', gap: Spacing.md },
  heroStatItem: { flex: 1 },
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
