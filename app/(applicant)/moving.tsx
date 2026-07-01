import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { fetchChecklist, fetchTenancy } from '@/lib/db';
import { CurrentTenancy, DepositScheme, MovingChecklistItem } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const schemeColors: Record<DepositScheme, string> = {
  TDS: Colors.accent.gold,
  DPS: Colors.accent.olive,
  MyDeposits: '#4A90D9',
};

const statusLabel: Record<string, string> = {
  held: 'Protected & held',
  dispute_raised: 'Dispute in progress',
  returned_full: 'Returned in full',
  returned_partial: 'Partially returned',
};

export default function MovingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tenancy, setTenancy] = useState<CurrentTenancy | null>(null);
  const [checklist, setChecklist] = useState<MovingChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchTenancy(user.id), fetchChecklist(user.id)]).then(([t, cl]) => {
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

  const completed = checklist.filter((i) => i.completed).length;
  const total = checklist.length;
  const depositInfo = tenancy?.depositInfo;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Moving</Text>
          <Text style={styles.subtitle}>Admin, deposit protection, and your rights at move-out.</Text>
        </View>

        <Pressable onPress={() => router.push('/(applicant)/moving/checklist' as any)}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons color={Colors.accent.gold} name="checkbox-outline" size={20} />
              </View>
              <Text style={styles.cardTitle}>Moving Checklist</Text>
              <Ionicons color={Colors.text.muted} name="chevron-forward" size={18} />
            </View>
            <ProgressBar current={completed} label={`${completed} of ${total} tasks complete`} total={total} />
            {completed < total && (
              <Text style={styles.pendingText}>
                {total - completed} task{total - completed > 1 ? 's' : ''} still to do — don&apos;t miss council tax
                or DVLA.
              </Text>
            )}
          </Card>
        </Pressable>

        <Pressable onPress={() => router.push('/(applicant)/moving/deposit' as any)}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons color={Colors.accent.gold} name="wallet-outline" size={20} />
              </View>
              <Text style={styles.cardTitle}>Deposit Tracker</Text>
              <Ionicons color={Colors.text.muted} name="chevron-forward" size={18} />
            </View>
            {depositInfo ? (
              <View style={styles.depositRow}>
                <View>
                  <Text style={styles.depositAmount}>£{depositInfo.amount.toLocaleString()}</Text>
                  <Text style={styles.depositSub}>{statusLabel[depositInfo.status]}</Text>
                </View>
                <View style={[styles.schemeBadge, { borderColor: schemeColors[depositInfo.scheme] }]}>
                  <Text style={[styles.schemeLabel, { color: schemeColors[depositInfo.scheme] }]}>
                    {depositInfo.scheme}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.depositSub}>No deposit information yet</Text>
            )}
          </Card>
        </Pressable>

        <Pressable onPress={() => router.push('/(applicant)/moving/dispute' as any)}>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons color={Colors.accent.gold} name="shield-outline" size={20} />
              </View>
              <Text style={styles.cardTitle}>Deposit Dispute Guide</Text>
              <Ionicons color={Colors.text.muted} name="chevron-forward" size={18} />
            </View>
            <Text style={styles.disputeText}>
              Know your rights before move-out. Step-by-step guide to challenging unfair deductions through TDS, DPS,
              or MyDeposits.
            </Text>
          </Card>
        </Pressable>

        <Card style={styles.rightsCard} tone="muted">
          <View style={styles.rightsHeader}>
            <Ionicons color={Colors.accent.gold} name="information-circle-outline" size={18} />
            <Text style={styles.rightsTitle}>Your rights (Renters&apos; Rights Act 2025)</Text>
          </View>
          {[
            'Landlords cannot charge for fair wear and tear.',
            'Professional cleaning cannot be required as a tenancy condition.',
            'You have the right to dispute deductions through your scheme.',
            'No-fault evictions (Section 21) are now abolished.',
          ].map((right) => (
            <View key={right} style={styles.rightRow}>
              <Ionicons color={Colors.accent.olive} name="checkmark-circle" size={16} />
              <Text style={styles.rightText}>{right}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { gap: Spacing.xs },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  card: { gap: Spacing.md },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  iconWrap: {
    alignItems: 'center',
    borderColor: Colors.border.accent,
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  cardTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  pendingText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  depositRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  depositAmount: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  depositSub: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  schemeBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  schemeLabel: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  disputeText: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  rightsCard: { gap: Spacing.md },
  rightsHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  rightsTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  rightRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.sm },
  rightText: { color: Colors.text.secondary, flex: 1, fontSize: Typography.sizes.sm, lineHeight: 20 },
});
