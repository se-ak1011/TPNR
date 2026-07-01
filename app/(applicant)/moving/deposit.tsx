import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import { fetchTenancy } from '@/lib/db';
import { CurrentTenancy, DepositScheme } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const schemeInfo: Record<DepositScheme, { color: string; website: string; phone: string; description: string }> = {
  TDS: {
    color: Colors.accent.gold,
    website: 'https://www.tenancydepositscheme.com',
    phone: '0300 037 1000',
    description: 'Tenancy Deposit Scheme (TDS)',
  },
  DPS: {
    color: Colors.accent.olive,
    website: 'https://www.depositprotection.com',
    phone: '0330 303 0030',
    description: 'Deposit Protection Service (DPS)',
  },
  MyDeposits: {
    color: '#4A90D9',
    website: 'https://www.mydeposits.co.uk',
    phone: '0333 321 9401',
    description: 'mydeposits',
  },
};

const statusInfo: Record<string, { label: string; color: string; description: string }> = {
  held: {
    label: 'Held & protected',
    color: Colors.success,
    description:
      'Your deposit is legally protected. Your landlord must return it within 10 days of you agreeing the final amount at the end of your tenancy.',
  },
  dispute_raised: {
    label: 'Dispute in progress',
    color: Colors.accent.gold,
    description:
      'A dispute has been raised. The scheme will adjudicate and make a decision — usually within 28 days.',
  },
  returned_full: {
    label: 'Returned in full',
    color: Colors.success,
    description: 'Your full deposit has been returned. No further action needed.',
  },
  returned_partial: {
    label: 'Partially returned',
    color: Colors.accent.gold,
    description:
      'Part of your deposit was deducted. You have 3 months from the end of tenancy to raise a dispute if you disagree.',
  },
};

export default function DepositScreen() {
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

  if (!tenancy) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg }}>
          <Ionicons color={Colors.text.muted} name="wallet-outline" size={40} />
          <Text style={{ color: Colors.text.secondary, fontSize: Typography.sizes.md, textAlign: 'center', lineHeight: 22 }}>
            No deposit information yet. This screen will populate when your tenancy is set up.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { depositInfo } = tenancy;
  const scheme = schemeInfo[depositInfo.scheme];
  const status = statusInfo[depositInfo.status];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Deposit Tracker</Text>
          <Text style={styles.subtitle}>{depositInfo.propertyAddress}</Text>
        </View>

        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Deposit held</Text>
          <Text style={styles.amount}>£{depositInfo.amount.toLocaleString()}</Text>
          <View style={[styles.statusBadge, { borderColor: status.color }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.statusDesc}>{status.description}</Text>
        </Card>

        <Card style={styles.detailsCard}>
          {[
            { label: 'Protection scheme', value: scheme.description },
            { label: 'Scheme reference', value: depositInfo.schemeRef },
            {
              label: 'Paid',
              value: new Date(depositInfo.paidAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            },
            { label: 'Landlord', value: depositInfo.landlordName },
            ...(depositInfo.expectedReturnDate
              ? [
                  {
                    label: 'Expected return',
                    value: new Date(depositInfo.expectedReturnDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }),
                  },
                ]
              : []),
          ].map(({ label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.schemeCard}>
          <View style={styles.schemeHeader}>
            <View style={[styles.schemeBadge, { borderColor: scheme.color }]}>
              <Text style={[styles.schemeBadgeText, { color: scheme.color }]}>{depositInfo.scheme}</Text>
            </View>
            <Text style={styles.schemeTitle}>Contact your scheme</Text>
          </View>
          <View style={styles.schemeActions}>
            <Pressable onPress={() => Linking.openURL(`tel:${scheme.phone}`)} style={styles.schemeAction}>
              <Ionicons color={Colors.accent.gold} name="call-outline" size={18} />
              <Text style={styles.schemeActionText}>{scheme.phone}</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL(scheme.website)} style={styles.schemeAction}>
              <Ionicons color={Colors.text.secondary} name="globe-outline" size={18} />
              <Text style={styles.schemeActionText}>Visit website</Text>
            </Pressable>
          </View>
        </Card>

        <Pressable onPress={() => router.push('/(applicant)/moving/dispute' as any)}>
          <Card style={styles.disputeLink}>
            <Ionicons color={Colors.accent.gold} name="shield-outline" size={20} />
            <View style={styles.disputeContent}>
              <Text style={styles.disputeTitle}>Think deductions might be unfair?</Text>
              <Text style={styles.disputeSubtitle}>Read the dispute guide →</Text>
            </View>
          </Card>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { gap: Spacing.xs },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md },
  amountCard: { alignItems: 'flex-start', gap: Spacing.md },
  amountLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, letterSpacing: 0.5, textTransform: 'uppercase' },
  amount: { color: Colors.text.primary, fontSize: 48, fontWeight: Typography.weights.bold },
  statusBadge: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  statusDot: { borderRadius: 4, height: 8, width: 8 },
  statusLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  statusDesc: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  detailsCard: { gap: Spacing.md },
  detailRow: { flexDirection: 'row', gap: Spacing.md, justifyContent: 'space-between' },
  detailLabel: { color: Colors.text.muted, fontSize: Typography.sizes.sm },
  detailValue: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, textAlign: 'right' },
  schemeCard: { gap: Spacing.md },
  schemeHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  schemeBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  schemeBadgeText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  schemeTitle: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  schemeActions: { gap: Spacing.sm },
  schemeAction: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  schemeActionText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  disputeLink: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  disputeContent: { flex: 1, gap: 3 },
  disputeTitle: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  disputeSubtitle: { color: Colors.accent.gold, fontSize: Typography.sizes.sm },
});
