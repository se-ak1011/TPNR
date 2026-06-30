import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentTenancy } from '@/data/mockData';
import { MaintenancePriority, MaintenanceRequest, MaintenanceStatus } from '@/types';

const priorityConfig: Record<MaintenancePriority, { color: string; label: string }> = {
  low: { color: Colors.text.muted, label: 'Low' },
  medium: { color: Colors.accent.gold, label: 'Medium' },
  high: { color: Colors.error, label: 'High' },
  emergency: { color: Colors.error, label: 'Emergency' },
};

const statusConfig: Record<MaintenanceStatus, { color: string; label: string }> = {
  logged: { color: Colors.text.muted, label: 'Logged' },
  acknowledged: { color: '#4A90D9', label: 'Acknowledged' },
  in_progress: { color: Colors.accent.gold, label: 'In progress' },
  resolved: { color: Colors.success, label: 'Resolved' },
  closed: { color: Colors.text.muted, label: 'Closed' },
};

const categoryIcons: Record<string, string> = {
  plumbing: 'water-outline',
  electrical: 'flash-outline',
  heating: 'flame-outline',
  appliance: 'hardware-chip-outline',
  structural: 'business-outline',
  damp_mould: 'rainy-outline',
  other: 'build-outline',
};

function RequestCard({ request }: { request: MaintenanceRequest }) {
  const priority = priorityConfig[request.priority];
  const status = statusConfig[request.status];
  const isResolved = request.status === 'resolved' || request.status === 'closed';

  return (
    <Card style={[styles.requestCard, isResolved ? styles.resolvedCard : {}]}>
      <View style={styles.requestHeader}>
        <Ionicons color={isResolved ? Colors.text.muted : priority.color} name={categoryIcons[request.category] as any} size={20} />
        <View style={styles.requestMeta}>
          <Text style={[styles.requestTitle, isResolved ? styles.resolvedText : {}]}>{request.title}</Text>
          <Text style={styles.requestDate}>Logged {request.loggedAt}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.badge, { borderColor: status.color }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.requestDescription}>{request.description}</Text>
      {request.landlordResponse && (
        <View style={styles.responseBox}>
          <Text style={styles.responseLabel}>Landlord response</Text>
          <Text style={styles.responseText}>{request.landlordResponse}</Text>
        </View>
      )}
      {!request.landlordResponse && !isResolved && (
        <Text style={styles.noResponse}>No response yet — logged {request.loggedAt}</Text>
      )}
    </Card>
  );
}

export default function MaintenanceScreen() {
  const router = useRouter();
  const { maintenanceRequests } = currentTenancy;

  const open = maintenanceRequests.filter((r) => r.status !== 'resolved' && r.status !== 'closed');
  const resolved = maintenanceRequests.filter((r) => r.status === 'resolved' || r.status === 'closed');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Maintenance</Text>
            <Text style={styles.subtitle}>
              {open.length} open · {resolved.length} resolved
            </Text>
          </View>
          <Button
            fullWidth={false}
            icon="add"
            title="Log issue"
            onPress={() => router.push('/(applicant)/home/maintenance-new')}
            variant="secondary"
          />
        </View>

        <Card style={styles.tipCard} tone="muted">
          <View style={styles.tipRow}>
            <Ionicons color={Colors.accent.gold} name="information-circle-outline" size={18} />
            <Text style={styles.tipText}>
              Always log issues in writing. This creates a timestamped record you can use if a dispute arises.
            </Text>
          </View>
        </Card>

        {open.length > 0 && (
          <>
            <Text style={styles.groupLabel}>Open requests</Text>
            {open.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </>
        )}

        {resolved.length > 0 && (
          <>
            <Text style={styles.groupLabel}>Resolved</Text>
            {resolved.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </>
        )}

        {maintenanceRequests.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons color={Colors.text.muted} name="checkmark-circle-outline" size={32} />
            <Text style={styles.emptyTitle}>No issues logged</Text>
            <Text style={styles.emptyText}>When something needs fixing, log it here to create a paper trail.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md },
  tipCard: {},
  tipRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.sm },
  tipText: { color: Colors.text.secondary, flex: 1, fontSize: Typography.sizes.sm, lineHeight: 20 },
  groupLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  requestCard: { gap: Spacing.md },
  resolvedCard: { opacity: 0.6 },
  requestHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.md },
  requestMeta: { flex: 1, gap: 3 },
  requestTitle: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  resolvedText: { color: Colors.text.secondary },
  requestDate: { color: Colors.text.muted, fontSize: Typography.sizes.xs },
  badges: { alignItems: 'flex-end', gap: 4 },
  badge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  badgeText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  requestDescription: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  responseBox: { backgroundColor: Colors.background.tertiary, borderRadius: 8, gap: 4, padding: Spacing.md },
  responseLabel: { color: Colors.text.muted, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold, textTransform: 'uppercase' },
  responseText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  noResponse: { color: Colors.text.muted, fontSize: Typography.sizes.xs, fontStyle: 'italic' },
  emptyCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  emptyTitle: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  emptyText: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22, textAlign: 'center' },
});
