import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, STATUS_LABELS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { applicationStatusOrder, useCurrentApplicantData } from '@/lib/db';
import { ApplicationStatus } from '@/types';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applicant: currentApplicant, loading } = useCurrentApplicantData();

  const counts = applicationStatusOrder.reduce<Record<ApplicationStatus, number>>((acc, status) => {
    acc[status] = currentApplicant.applications.filter((item) => item.status === status).length;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Applications</Text>
            <Text style={styles.subtitle}>Track each property from first draft to final decision.</Text>
          </View>
          <Button fullWidth={false} title="New" onPress={() => router.push('/(applicant)/applications/new')} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statusRow}>
            {applicationStatusOrder.map((status) => (
              <Card key={status} style={styles.statusCard} tone="muted">
                <Text style={styles.statusCount}>{counts[status]}</Text>
                <Text style={styles.statusLabel}>{STATUS_LABELS[status]}</Text>
              </Card>
            ))}
          </View>
        </ScrollView>

        {currentApplicant.applications.map((application) => (
          <Pressable key={application.id} onPress={() => router.push(`/(applicant)/applications/${application.id}`)}>
            <Card style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <View style={styles.applicationMeta}>
                  <Text style={styles.address}>{application.propertyAddress}</Text>
                  <Text style={styles.meta}>{application.agencyName} • Ref {application.propertyRef}</Text>
                </View>
                <Ionicons color={Colors.text.secondary} name="chevron-forward" size={18} />
              </View>
              <View style={styles.footer}>
                <Badge status={application.status} />
                <Text style={styles.rent}>£{application.monthlyRent?.toLocaleString()} pcm</Text>
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
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
  },
  container: {
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statusCard: {
    gap: Spacing.xs,
    minWidth: 120,
  },
  statusCount: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  statusLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  applicationCard: {
    gap: Spacing.md,
  },
  applicationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  applicationMeta: {
    flex: 1,
    gap: 4,
  },
  address: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  meta: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rent: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
