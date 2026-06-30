import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentTenancy } from '@/data/mockData';

type SectionRow = {
  icon: string;
  label: string;
  sublabel: string;
  route: string;
  accent?: string;
};

export default function MyHomeScreen() {
  const router = useRouter();

  const { maintenanceRequests, inventoryItems, contacts } = currentTenancy;
  const openRequests = maintenanceRequests.filter((r) => r.status !== 'resolved' && r.status !== 'closed');
  const urgentCount = openRequests.filter((r) => r.priority === 'high' || r.priority === 'emergency').length;
  const photosMissing = inventoryItems.filter((i) => !i.photoTaken).length;

  const sections: SectionRow[] = [
    {
      icon: 'camera-outline',
      label: 'Inventory',
      sublabel: `${inventoryItems.length} items across ${[...new Set(inventoryItems.map((i) => i.room))].length} rooms${photosMissing > 0 ? ` · ${photosMissing} photo${photosMissing > 1 ? 's' : ''} missing` : ' · All photos taken'}`,
      route: '/(applicant)/home/inventory',
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
    },
    {
      icon: 'call-outline',
      label: 'Contacts',
      sublabel: `${contacts.length} contacts — landlord, agent, emergency`,
      route: '/(applicant)/home/contacts',
    },
  ];

  const start = new Date(currentTenancy.tenancyStartDate);
  const end = new Date(currentTenancy.tenancyEndDate);
  const today = new Date();
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const monthsLeft = Math.ceil(daysLeft / 30);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Home</Text>
          <Text style={styles.address}>{currentTenancy.propertyAddress}</Text>
        </View>

        <Card style={styles.tenancyCard}>
          <View style={styles.tenancyRow}>
            <View style={styles.tenancyStat}>
              <Text style={styles.tenancyValue}>
                {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
              <Text style={styles.tenancyValue}>£{currentTenancy.monthlyRent.toLocaleString()}</Text>
              <Text style={styles.tenancyLabel}>Monthly rent</Text>
            </View>
          </View>
        </Card>

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
  tenancyRow: { flexDirection: 'row', alignItems: 'center' },
  tenancyStat: { flex: 1, gap: 4, alignItems: 'center' },
  tenancyValue: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, textAlign: 'center' },
  tenancyLabel: { color: Colors.text.muted, fontSize: Typography.sizes.xs, textAlign: 'center' },
  tenancyDivider: { width: 1, height: 36, backgroundColor: Colors.border.default },
  urgentText: { color: Colors.accent.gold },
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
  alertRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  alertContent: { flex: 1, gap: 4 },
  alertTitle: { color: Colors.error, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  alertText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
});
