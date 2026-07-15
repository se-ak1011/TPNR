import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth';
import { fetchPassport } from '@/lib/db';
import { DocumentChecklist } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const DOC_ITEMS: { key: keyof DocumentChecklist; label: string; detail: string }[] = [
  { key: 'photoId', label: 'Photo ID', detail: 'Passport or driving licence' },
  { key: 'proofOfAddress', label: 'Proof of address', detail: 'Utility bill or bank statement dated within 3 months' },
  { key: 'bankStatements', label: 'Bank statements', detail: 'Last 3 months — shows regular income' },
  { key: 'employmentContract', label: 'Employment contract', detail: 'Current contract or offer letter' },
  { key: 'payslips', label: 'Payslips', detail: 'Last 3 months' },
  { key: 'references', label: 'References', detail: 'Previous landlord or employer letter' },
];

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentChecklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPassport(user.id).then((p) => {
      setDocs(p?.documents ?? null);
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

  const ready = docs ? DOC_ITEMS.filter((d) => docs[d.key]).length : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Documents</Text>
          <Text style={styles.subtitle}>Track which documents you have ready to share.</Text>
        </View>

        {docs && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Documents ready</Text>
              <Text style={styles.progressCount}>
                <Text style={{ color: ready === DOC_ITEMS.length ? Colors.success : Colors.accent.gold }}>{ready}</Text>
                /{DOC_ITEMS.length}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(ready / DOC_ITEMS.length) * 100}%` }]} />
            </View>
          </Card>
        )}

        <Card style={styles.checklistCard}>
          {DOC_ITEMS.map(({ key, label, detail }, idx) => {
            const done = docs?.[key] ?? false;
            return (
              <View key={key}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.docRow}>
                  <Ionicons
                    color={done ? Colors.success : Colors.text.muted}
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                  />
                  <View style={styles.docMeta}>
                    <Text style={[styles.docName, !done && styles.docNameMuted]}>{label}</Text>
                    <Text style={styles.docDetail}>{detail}</Text>
                  </View>
                  <Text style={[styles.docStatus, { color: done ? Colors.success : Colors.text.muted }]}>
                    {done ? 'Ready' : 'Missing'}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Card style={styles.uploadCard} tone="muted">
          <View style={styles.uploadRow}>
            <Ionicons color={Colors.text.muted} name="cloud-upload-outline" size={20} />
            <View style={styles.uploadMeta}>
              <Text style={styles.uploadTitle}>File uploads coming soon</Text>
              <Text style={styles.uploadSub}>
                Mark documents as ready in your passport onboarding. Secure file storage is being added.
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.tipCard} tone="muted">
          <View style={styles.tipRow}>
            <Ionicons color={Colors.accent.gold} name="shield-checkmark-outline" size={18} />
            <Text style={styles.tipTitle}>What to keep safe</Text>
          </View>
          {[
            'Tenancy agreement — your legal contract',
            "Deposit certificate — proof it's protected",
            'Move-in inventory — your deposit defence',
            'All correspondence with landlord / agent',
            'Any receipts for repairs you paid yourself',
          ].map((item) => (
            <View key={item} style={styles.listRow}>
              <Text style={styles.bullet}>·</Text>
              <Text style={styles.listText}>{item}</Text>
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
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md },
  progressCard: { gap: Spacing.md },
  progressHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: Colors.text.secondary, fontSize: Typography.sizes.sm },
  progressCount: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, fontVariant: ['tabular-nums'] as any },
  progressBar: { backgroundColor: Colors.background.tertiary, borderRadius: 4, height: 6, overflow: 'hidden' },
  progressFill: { backgroundColor: Colors.accent.gold, borderRadius: 4, height: '100%' },
  checklistCard: { gap: 0, paddingHorizontal: 0, paddingVertical: 0 },
  divider: { backgroundColor: Colors.border.subtle, height: 1 },
  docRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  docMeta: { flex: 1, gap: 2 },
  docName: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium },
  docNameMuted: { color: Colors.text.secondary },
  docDetail: { color: Colors.text.muted, fontSize: Typography.sizes.xs, lineHeight: 16 },
  docStatus: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  uploadCard: { gap: Spacing.sm },
  uploadRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.md },
  uploadMeta: { flex: 1, gap: 4 },
  uploadTitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.medium },
  uploadSub: { color: Colors.text.muted, fontSize: Typography.sizes.sm, lineHeight: 18 },
  tipCard: { gap: Spacing.sm },
  tipRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  tipTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  listRow: { flexDirection: 'row', gap: Spacing.sm, paddingLeft: Spacing.xs },
  bullet: { color: Colors.text.muted, fontSize: Typography.sizes.sm },
  listText: { color: Colors.text.secondary, flex: 1, fontSize: Typography.sizes.sm, lineHeight: 20 },
});
