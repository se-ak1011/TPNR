import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import {
  acceptPartnerInvite,
  fetchPassport,
  fetchPendingInviteForMe,
  fetchSentInvite,
  sendPartnerInvite,
  updateCreditScore,
} from '@/lib/db';
import { DocumentChecklist, PassportInvite, TenantPassport } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const DOC_LIST: { key: keyof DocumentChecklist; label: string }[] = [
  { key: 'photoId', label: 'Photo ID' },
  { key: 'proofOfAddress', label: 'Proof of address' },
  { key: 'bankStatements', label: 'Bank statements' },
  { key: 'employmentContract', label: 'Employment contract' },
  { key: 'payslips', label: 'Payslips' },
  { key: 'references', label: 'References' },
];

const money = (value?: number) => (value ? `£${value.toLocaleString()}` : '—');

const EMPLOYMENT_LABELS: Record<string, string> = {
  employed: 'Employed',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  student: 'Student',
  retired: 'Retired',
};

const SMOKING_LABELS: Record<string, string> = {
  non_smoker: 'Non-smoker',
  smoker: 'Smoker',
  outdoor_only: 'Outdoor only',
};

const RIGHT_TO_RENT_LABELS: Record<string, string> = {
  uk_citizen: 'UK Citizen',
  eu_settled: 'EU Settled Status',
  visa: 'Visa holder',
  other: 'Other',
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function creditScoreColor(score: number): string {
  if (score >= 800) return Colors.success;
  if (score >= 650) return Colors.accent.gold;
  return '#E07070';
}

function creditScoreLabel(score: number): string {
  if (score >= 800) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Fair';
  return 'Poor';
}

export default function PassportScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [passport, setPassport] = useState<TenantPassport | null>(null);
  const [loading, setLoading] = useState(true);

  // Credit score state
  const [scoreText, setScoreText] = useState('');
  const [scoreSaving, setScoreSaving] = useState(false);

  // Joint passport state
  const [sentInvite, setSentInvite] = useState<PassportInvite | null>(null);
  const [pendingInvite, setPendingInvite] = useState<PassportInvite | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [acceptingInvite, setAcceptingInvite] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const [p, sent, pending] = await Promise.all([
      fetchPassport(user.id),
      fetchSentInvite(user.id),
      fetchPendingInviteForMe(),
    ]);
    setPassport(p);
    if (p?.creditScore) setScoreText(String(p.creditScore));
    setSentInvite(sent);
    setPendingInvite(pending);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveScore = async () => {
    if (!user) return;
    const parsed = parseInt(scoreText, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 999) {
      Alert.alert('Invalid score', 'Please enter a number between 0 and 999.');
      return;
    }
    setScoreSaving(true);
    await updateCreditScore(user.id, parsed);
    const updated = await fetchPassport(user.id);
    setPassport(updated);
    setScoreSaving(false);
    Alert.alert('Saved', 'Your credit score has been updated.');
  };

  const handleSendInvite = async () => {
    if (!user || !passport) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    setInviteSending(true);
    try {
      await sendPartnerInvite(user.id, passport.fullName, email);
      const sent = await fetchSentInvite(user.id);
      setSentInvite(sent);
      setInviteEmail('');
    } catch {
      Alert.alert('Error', 'Could not send invite. Please try again.');
    } finally {
      setInviteSending(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!pendingInvite) return;
    setAcceptingInvite(true);
    try {
      await acceptPartnerInvite(pendingInvite.id);
      await loadData();
    } catch {
      Alert.alert('Error', 'Could not accept invite. Please try again.');
      setAcceptingInvite(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator color={Colors.accent.gold} />
      </View>
    );
  }

  if (!passport) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg }}>
          <Text style={styles.title}>My Passport</Text>
          <Text style={{ color: Colors.text.secondary, textAlign: 'center' }}>
            Your passport isn't set up yet. Complete onboarding to get started.
          </Text>
          <Button title="Start onboarding" onPress={() => router.push('/(applicant)/onboarding/personal')} />
        </View>
      </SafeAreaView>
    );
  }

  // Joint passport card — which state are we in?
  const isLinked = !!passport.linkedPartnerId;
  const hasPendingForMe = !!pendingInvite && !isLinked;
  const hasSentPending = !!sentInvite && sentInvite.status === 'pending' && !isLinked;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>My Passport</Text>
          <Badge
            label={passport.isComplete ? 'Ready to share' : 'Needs updates'}
            color={passport.isComplete ? Colors.success : Colors.accent.gold}
          />
        </View>

        <Card tone="warm" style={styles.summaryCard}>
          <Text style={styles.summaryName}>{passport.fullName}</Text>
          {passport.notesForAgent ? <Text style={styles.summaryText}>{passport.notesForAgent}</Text> : null}
          <View style={styles.summaryStats}>
            <Text style={styles.summaryStat}>{money(passport.annualIncome)} income</Text>
            <Text style={styles.summaryStat}>{money(passport.monthlyBudget)} budget</Text>
          </View>
        </Card>

        {/* ── Credit health ──────────────────────────────────── */}
        <Card style={styles.sectionCard}>
          <View style={styles.creditHeader}>
            <Ionicons color={Colors.accent.gold} name="bar-chart-outline" size={20} />
            <Text style={styles.sectionTitle}>Credit health</Text>
          </View>

          {passport.creditScore ? (
            <View style={styles.scoreRow}>
              <View style={[styles.scoreBadge, { borderColor: creditScoreColor(passport.creditScore) }]}>
                <Text style={[styles.scoreNumber, { color: creditScoreColor(passport.creditScore) }]}>
                  {passport.creditScore}
                </Text>
                <Text style={[styles.scoreLabel, { color: creditScoreColor(passport.creditScore) }]}>
                  {creditScoreLabel(passport.creditScore)}
                </Text>
              </View>
              <Text style={styles.scoreUpdated}>
                Last updated{'\n'}{fmtDate(passport.creditScoreUpdatedAt)}
              </Text>
            </View>
          ) : (
            <Text style={styles.creditEmpty}>
              No score on file. Check your Experian report and enter your score below.
            </Text>
          )}

          <Pressable
            onPress={() => Linking.openURL('https://www.experian.co.uk/consumer/')}
            style={styles.experianButton}>
            <Ionicons color="#fff" name="open-outline" size={16} />
            <Text style={styles.experianButtonText}>Check score on Experian</Text>
          </Pressable>

          <View style={styles.scoreInputRow}>
            <TextInput
              keyboardType="numeric"
              maxLength={3}
              onChangeText={setScoreText}
              placeholder="Enter score (0–999)"
              placeholderTextColor={Colors.text.muted}
              style={styles.scoreInput}
              value={scoreText}
            />
            <Pressable
              disabled={scoreSaving || !scoreText}
              onPress={handleSaveScore}
              style={[styles.savePill, (!scoreText || scoreSaving) && styles.savePillDisabled]}>
              {scoreSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.savePillText}>Save</Text>
              )}
            </Pressable>
          </View>
        </Card>

        {/* ── Joint passport ─────────────────────────────────── */}
        <Card style={styles.sectionCard}>
          <View style={styles.creditHeader}>
            <Ionicons color={Colors.accent.gold} name="people-outline" size={20} />
            <Text style={styles.sectionTitle}>Joint passport</Text>
          </View>

          {isLinked ? (
            // State (d): linked
            <View style={styles.linkedRow}>
              <Ionicons color={Colors.success} name="checkmark-circle" size={22} />
              <Text style={styles.linkedText}>Linked with <Text style={{ fontWeight: Typography.weights.bold }}>{passport.linkedPartnerName}</Text></Text>
            </View>
          ) : hasPendingForMe ? (
            // State (c): I was invited
            <View style={styles.inviteBanner}>
              <View style={styles.inviteBannerTop}>
                <Ionicons color={Colors.accent.gold} name="mail-outline" size={18} />
                <Text style={styles.inviteBannerTitle}>
                  {pendingInvite!.inviterName} invited you to link passports
                </Text>
              </View>
              <Text style={styles.inviteBannerSub}>
                Accepting will link your Tenant Passports so you can apply together.
              </Text>
              <Pressable
                disabled={acceptingInvite}
                onPress={handleAcceptInvite}
                style={[styles.experianButton, acceptingInvite && styles.savePillDisabled]}>
                {acceptingInvite ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons color="#fff" name="link-outline" size={16} />
                    <Text style={styles.experianButtonText}>Accept invite</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : hasSentPending ? (
            // State (b): invite sent, awaiting acceptance
            <View style={styles.pendingRow}>
              <Ionicons color={Colors.text.muted} name="time-outline" size={18} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingTitle}>Invite sent</Text>
                <Text style={styles.pendingEmail}>{sentInvite!.inviteeEmail}</Text>
                <Text style={styles.pendingSub}>
                  They'll receive a magic link to sign in and accept. Once they do, your passports will link automatically.
                </Text>
              </View>
            </View>
          ) : (
            // State (a): no invite yet
            <>
              <Text style={styles.jointDesc}>
                Applying with a partner? Invite them to link your Tenant Passports. They'll get a sign-in link by email.
              </Text>
              <View style={styles.scoreInputRow}>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setInviteEmail}
                  placeholder="Partner's email address"
                  placeholderTextColor={Colors.text.muted}
                  style={[styles.scoreInput, { flex: 1 }]}
                  value={inviteEmail}
                />
              </View>
              <Pressable
                disabled={inviteSending || !inviteEmail.trim()}
                onPress={handleSendInvite}
                style={[styles.experianButton, (!inviteEmail.trim() || inviteSending) && styles.savePillDisabled]}>
                {inviteSending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons color="#fff" name="paper-plane-outline" size={16} />
                    <Text style={styles.experianButtonText}>Send magic link invite</Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </Card>

        {/* ── Passport details ───────────────────────────────── */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal details</Text>
          <Detail label="Email" value={passport.email || '—'} />
          <Detail label="Phone" value={passport.phone || '—'} />
          <Detail label="Current address" value={passport.currentAddress || '—'} />
          <Detail label="Desired move-in date" value={fmtDate(passport.desiredMoveInDate)} />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Employment & affordability</Text>
          <Detail label="Employment status" value={EMPLOYMENT_LABELS[passport.employmentStatus] ?? '—'} />
          <Detail label="Employer" value={passport.employer || 'Not provided'} />
          <Detail label="Job title" value={passport.jobTitle || 'Not provided'} />
          <Detail label="Annual income" value={money(passport.annualIncome)} />
          <Detail label="Monthly budget" value={money(passport.monthlyBudget)} />
          <Detail
            label="Guarantor"
            value={
              passport.hasGuarantor
                ? `${passport.guarantorName} · ${passport.guarantorRelationship}`
                : 'Not required'
            }
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Lifestyle & references</Text>
          <Detail label="Pets" value={passport.hasPets ? passport.petDetails || 'Yes' : 'No pets'} />
          <Detail
            label="Children / dependants"
            value={passport.hasChildren ? `${passport.numberOfDependants ?? 0} dependant(s)` : 'None'}
          />
          <Detail label="Smoking" value={SMOKING_LABELS[passport.smokingStatus] ?? '—'} />
          <Detail label="Right to Rent" value={RIGHT_TO_RENT_LABELS[passport.rightToRent] ?? '—'} />
          <Detail
            label="References"
            value={passport.hasReferences ? passport.referenceDetails || 'Available' : 'Not yet added'}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Documents checklist</Text>
          {DOC_LIST.map(({ key, label }) => {
            const complete = passport.documents[key];
            return (
              <View key={key} style={styles.documentRow}>
                <View style={styles.documentLeft}>
                  <Ionicons
                    color={complete ? Colors.success : Colors.text.muted}
                    name={complete ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                  />
                  <Text style={styles.documentText}>{label}</Text>
                </View>
                <Text style={[styles.documentStatus, { color: complete ? Colors.success : Colors.text.secondary }]}>
                  {complete ? 'Uploaded' : 'Missing'}
                </Text>
              </View>
            );
          })}
        </Card>

        <Button
          title="Update onboarding answers"
          onPress={() => router.push('/(applicant)/onboarding/personal')}
          variant="secondary"
        />
        <Button title="Sign out" onPress={signOut} variant="ghost" />
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
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold },
  summaryCard: { gap: Spacing.md },
  summaryName: { color: Colors.text.inverse, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  summaryText: { color: '#4D453D', fontSize: Typography.sizes.md, lineHeight: 22 },
  summaryStats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  summaryStat: { color: Colors.text.inverse, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  sectionCard: { gap: Spacing.md },
  sectionTitle: { color: Colors.text.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  detailRow: { borderTopColor: Colors.border.subtle, borderTopWidth: 1, gap: Spacing.xs, paddingTop: Spacing.md },
  detailLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  detailValue: { color: Colors.text.primary, fontSize: Typography.sizes.md, lineHeight: 22 },
  documentRow: {
    alignItems: 'center',
    borderTopColor: Colors.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
  },
  documentLeft: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  documentText: { color: Colors.text.primary, fontSize: Typography.sizes.md },
  documentStatus: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  // Credit health
  creditHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  creditEmpty: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  scoreRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.lg },
  scoreBadge: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  scoreNumber: { fontSize: 40, fontWeight: Typography.weights.bold, lineHeight: 44 },
  scoreLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, textTransform: 'uppercase' },
  scoreUpdated: { color: Colors.text.muted, fontSize: Typography.sizes.sm, lineHeight: 18 },
  experianButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent.gold,
    borderRadius: 10,
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  experianButtonText: { color: '#fff', fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  scoreInputRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  scoreInput: {
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.border.default,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.text.primary,
    flex: 1,
    fontSize: Typography.sizes.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  savePill: {
    alignItems: 'center',
    backgroundColor: Colors.accent.gold,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
  },
  savePillDisabled: { opacity: 0.4 },
  savePillText: { color: '#fff', fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },

  // Joint passport
  jointDesc: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  linkedRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  linkedText: { color: Colors.text.primary, fontSize: Typography.sizes.md },
  inviteBanner: { gap: Spacing.sm },
  inviteBannerTop: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  inviteBannerTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  inviteBannerSub: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  pendingRow: { flexDirection: 'row', gap: Spacing.md },
  pendingTitle: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  pendingEmail: { color: Colors.accent.gold, fontSize: Typography.sizes.sm },
  pendingSub: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 18, marginTop: 4 },
});
