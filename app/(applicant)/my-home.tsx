import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import { fetchTenancy } from '@/lib/db';
import { CurrentTenancy } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function MyHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tenancy, setTenancy] = useState<CurrentTenancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTenancy(user.id).then((t) => {
      setTenancy(t);
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

  const openRequests = (tenancy?.maintenanceRequests ?? []).filter(
    (r) => r.status !== 'resolved' && r.status !== 'closed',
  );
  const urgentCount = openRequests.filter((r) => r.priority === 'high' || r.priority === 'emergency').length;
  const inventoryItems = tenancy?.inventoryItems ?? [];
  const photosMissing = inventoryItems.filter((i) => !i.photoTaken).length;
  const contacts = tenancy?.contacts ?? [];

  const sections = [
    {
      icon: 'camera-outline',
      label: 'Inventory',
      sublabel: inventoryItems.length > 0
        ? `${inventoryItems.length} items · ${photosMissing > 0 ? `${photosMissing} photo${photosMissing > 1 ? 's' : ''} missing` : 'All photos taken'}`
        : 'No items recorded yet',
      route: '/(applicant)/home/inventory',
      accent: undefined as string | undefined,
    },
    {
      icon: 'construct-outline',
      label: 'Maintenance',
      sublabel:
        openRequests.length > 0
          ? `${openRequests.length} open request${openRequests.length > 1 ? 's' : ''}${urgentCount > 0 ? ` · ${urgentCount} urgent` : ''}`
          : 'No open requests',
      route: '/(applicant)/home/maintenance',
      accent: urgentCount > 0 ? Colors.error : undefined,
    },
    {
      icon: 'document-text-outline',
      label: 'Documents',
      sublabel: 'Tenancy agreement, correspondence & more',
      route: '/(applicant)/home/documents',
      accent: undefined as string | undefined,
    },
    {
      icon: 'call-outline',
      label: 'Contacts',
      sublabel: contacts.length > 0 ? `${contacts.length} contacts — landlord, agent, emergency` : 'No contacts added yet',
      route: '/(applicant)/home/contacts',
      accent: undefined as string | undefined,
    },
  ];

  const start = tenancy ? new Date(tenancy.tenancyStartDate) : null;
  const end = tenancy ? new Date(tenancy.tenancyEndDate) : null;
  const today = new Date();
  const daysLeft = end ? Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const monthsLeft = Math.ceil(daysLeft / 30);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Home</Text>
          <Text style={styles.address}>
            {tenancy?.propertyAddress ?? 'No tenancy set up yet'}
          </Text>
        </View>

        {tenancy ? (
          <Card style={styles.tenancyCard}>
            <View style={styles.tenancyRow}>
              <View style={styles.tenancyStat}>
                <Text style={styles.tenancyValue}>
                  {start!.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                <Text style={styles.tenancyLabel}>Tenancy started</Text>
              </View>
              <View style={styles.tenancyDivider} />
              <View style={styles.tenancyStat}>
                <Text style={[styles.tenancyValue, daysLeft < 60 ? styles.urgentText : {}]}>
                  {monthsLeft > 0 ? `${monthsLeft} months` : `${daysLeft} days`}
                </Text>
                <Text style={styles.tenancyLabel}>Until lease end</Text>
              </View>
              <View style={styles.tenancyDivider} />
              <View style={styles.tenancyStat}>
                <Text style={styles.tenancyValue}>£{tenancy.monthlyRent.toLocaleString()}</Text>
                <Text style={styles.tenancyLabel}>Monthly rent</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.noTenancyCard} tone="muted">
            <Ionicons color={Colors.text.muted} name="home-outline" size={28} />
            <Text style={styles.noTenancyText}>
              Your tenancy details will appear here once set up. In the meantime, you can still log maintenance issues.
            </Text>
          </Card>
        )}

        <Text style={styles.sectionLabel}>Manage your home</Text>

        {sections.map((section) => (
          <Pressable key={section.label} onPress={() => router.push(section.route as any)}>
            <Card style={styles.sectionCard}>
              <View style={styles.sectionRow}>
                <View style={[styles.iconWrap, section.accent ? { borderColor: section.accent } : {}]}>
                  <Ionicons color={section.accent ?? Colors.accent.gold} name={section.icon as any} size={22} />
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionTitle}>{section.label}</Text>
                  <Text style={[styles.sectionSublabel, section.accent ? { color: section.accent } : {}]}>
                    {section.sublabel}
                  </Text>
                </View>
                <Ionicons color={Colors.text.muted} name="chevron-forward" size={18} />
              </View>
            </Card>
          </Pressable>
        ))}

        {urgentCount > 0 && (
          <Card style={styles.alertCard}>
            <View style={styles.alertRow}>
              <Ionicons color={Colors.error} name="warning-outline" size={20} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Urgent maintenance needs attention</Text>
                <Text style={styles.alertText}>
                  You have {urgentCount} high-priority request{urgentCount > 1 ? 's' : ''} that may need chasing.
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { gap: Spacing.xs },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold },
  address: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  tenancyCard: {},
  tenancyRow: { alignItems: 'center', flexDirection: 'row' },
  tenancyStat: { alignItems: 'center', flex: 1, gap: 4 },
  tenancyValue: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, textAlign: 'center' },
  tenancyLabel: { color: Colors.text.muted, fontSize: Typography.sizes.xs, textAlign: 'center' },
  tenancyDivider: { backgroundColor: Colors.border.default, height: 36, width: 1 },
  urgentText: { color: Colors.accent.gold },
  noTenancyCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  noTenancyText: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22, textAlign: 'center' },
  sectionLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, letterSpacing: 0.5, textTransform: 'uppercase' },
  sectionCard: {},
  sectionRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  iconWrap: {
    alignItems: 'center',
    borderColor: Colors.border.accent,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sectionContent: { flex: 1, gap: 3 },
  sectionTitle: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  sectionSublabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  alertCard: { borderColor: Colors.error, borderWidth: 1 },
  alertRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.md },
  alertContent: { flex: 1, gap: 4 },
  alertTitle: { color: Colors.error, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  alertText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
});
