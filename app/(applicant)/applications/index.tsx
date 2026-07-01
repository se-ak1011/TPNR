import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Badge, STATUS_LABELS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import { APPLICATION_STATUS_ORDER, fetchApplications } from '@/lib/db';
import { ApplicationStatus, PropertyApplication } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<PropertyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchApplications(user.id).then((apps) => {
      setApplications(apps);
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

  const counts = APPLICATION_STATUS_ORDER.reduce<Record<ApplicationStatus, number>>((acc, status) => {
    acc[status] = applications.filter((a) => a.status === status).length;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

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
            {APPLICATION_STATUS_ORDER.map((status) => (
              <Card key={status} style={styles.statusCard} tone="muted">
                <Text style={styles.statusCount}>{counts[status]}</Text>
                <Text style={styles.statusLabel}>{STATUS_LABELS[status]}</Text>
              </Card>
            ))}
          </View>
        </ScrollView>

        {applications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons color={Colors.text.muted} name="document-text-outline" size={32} />
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyText}>
              Tap "New" to start tracking a property. Each application builds your rental history.
            </Text>
          </Card>
        ) : (
          applications.map((application) => (
            <Pressable
              key={application.id}
              onPress={() => router.push(`/(applicant)/applications/${application.id}`)}>
              <Card style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationMeta}>
                    <Text style={styles.address}>{application.propertyAddress}</Text>
                    <Text style={styles.meta}>
                      {application.agencyName}
                      {application.propertyRef ? ` · Ref ${application.propertyRef}` : ''}
                    </Text>
                  </View>
                  <Ionicons color={Colors.text.secondary} name="chevron-forward" size={18} />
                </View>
                <View style={styles.footer}>
                  <Badge status={application.status} />
                  <Text style={styles.rent}>
                    {application.monthlyRent ? `£${application.monthlyRent.toLocaleString()} pcm` : '—'}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md },
  statusRow: { flexDirection: 'row', gap: Spacing.md },
  statusCard: { gap: Spacing.xs, minWidth: 120 },
  statusCount: { color: Colors.text.primary, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  statusLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  emptyCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  emptyTitle: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  emptyText: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22, textAlign: 'center' },
  applicationCard: { gap: Spacing.md },
  applicationHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  applicationMeta: { flex: 1, gap: 4 },
  address: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  meta: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  rent: { color: Colors.text.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
});
