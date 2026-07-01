import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Badge, STATUS_LABELS } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import { APPLICATION_STATUS_ORDER, fetchApplication, fetchPassport } from '@/lib/db';
import { PropertyApplication, TenantPassport } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const money = (value?: number) => (value ? `£${value.toLocaleString()} pcm` : 'Not set');
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined;

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [application, setApplication] = useState<PropertyApplication | null>(null);
  const [passport, setPassport] = useState<TenantPassport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([fetchApplication(id), fetchPassport(user.id)]).then(([app, p]) => {
      setApplication(app);
      setPassport(p);
      setLoading(false);
    });
  }, [user, id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator color={Colors.accent.gold} />
      </View>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg }}>
          <Text style={{ color: Colors.text.primary, fontSize: Typography.sizes.lg }}>Application not found.</Text>
          <Button title="Back to applications" onPress={() => router.replace('/(applicant)/applications')} />
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = APPLICATION_STATUS_ORDER.indexOf(application.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>{application.propertyAddress}</Text>
          <Text style={styles.heroText}>
            {application.agencyName}
            {application.agentName ? ` · Managed by ${application.agentName}` : ''}
          </Text>
          <Badge status={application.status} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Status journey</Text>
          {APPLICATION_STATUS_ORDER.map((status, index) => {
            const active = index <= currentIndex && currentIndex !== -1;
            return (
              <View key={status} style={styles.timelineRow}>
                <Ionicons
                  color={active ? Colors.accent.gold : Colors.text.muted}
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                />
                <Text style={[styles.timelineText, { color: active ? Colors.text.primary : Colors.text.secondary }]}>
                  {STATUS_LABELS[status]}
                </Text>
              </View>
            );
          })}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Application details</Text>
          <Detail label="Reference" value={application.propertyRef || 'Not provided'} />
          <Detail label="Submitted" value={fmtDate(application.submittedAt) ?? 'Saved as draft'} />
          <Detail label="Last updated" value={fmtDate(application.updatedAt) ?? application.updatedAt} />
          <Detail label="Monthly rent" value={money(application.monthlyRent)} />
          <Detail label="Your notes" value={application.notes || 'No notes added'} />
          <Detail label="Agent notes" value={application.agentNotes || 'No updates yet'} />
        </Card>

        {passport && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Passport snapshot</Text>
            <Detail label="Applicant" value={passport.fullName} />
            <Detail
              label="Employment"
              value={
                passport.jobTitle && passport.employer
                  ? `${passport.jobTitle} at ${passport.employer}`
                  : passport.employer || passport.jobTitle || '—'
              }
            />
            <Detail
              label="Monthly budget"
              value={passport.monthlyBudget ? `£${passport.monthlyBudget.toLocaleString()} pcm` : '—'}
            />
            <Detail
              label="References"
              value={passport.hasReferences ? 'Ready to share' : 'Still outstanding'}
            />
          </Card>
        )}

        <View style={styles.actions}>
          <Button title="Back to applications" onPress={() => router.replace('/(applicant)/applications')} />
          <Button title="Open my passport" onPress={() => router.push('/(applicant)/passport')} variant="secondary" />
        </View>
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
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  heroCard: { gap: Spacing.md },
  heroTitle: { color: Colors.text.inverse, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  heroText: { color: '#4D453D', fontSize: Typography.sizes.md },
  sectionCard: { gap: Spacing.md },
  sectionTitle: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  timelineRow: {
    alignItems: 'center',
    borderTopColor: Colors.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  timelineText: { fontSize: Typography.sizes.md },
  detailRow: { borderTopColor: Colors.border.subtle, borderTopWidth: 1, gap: Spacing.xs, paddingTop: Spacing.md },
  detailLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  detailValue: { color: Colors.text.primary, fontSize: Typography.sizes.md, lineHeight: 22 },
  actions: { gap: Spacing.md },
});
