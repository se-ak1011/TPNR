import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { completePassport, fetchPassport } from '@/lib/db';
import { DocumentChecklist } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

const DOC_LABELS: Record<keyof DocumentChecklist, string> = {
  photoId: 'Photo ID',
  proofOfAddress: 'Proof of address',
  bankStatements: 'Bank statements',
  employmentContract: 'Employment contract',
  payslips: 'Payslips',
  references: 'References',
};

const EMPTY_DOCS: DocumentChecklist = {
  photoId: false,
  proofOfAddress: false,
  bankStatements: false,
  employmentContract: false,
  payslips: false,
  references: false,
};

export default function DocumentsOnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentChecklist>(EMPTY_DOCS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPassport(user.id).then((p) => {
      if (p?.documents) setDocuments(p.documents);
    });
  }, [user]);

  const toggle = (key: keyof DocumentChecklist) => {
    setDocuments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinish = async () => {
    setSaving(true);
    await completePassport(user!.id, documents);
    setSaving(false);
    router.replace('/(applicant)/onboarding/complete');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={4} label="Step 4 of 4" total={4} />
        <Text style={styles.title}>Documents checklist</Text>

        <Card style={styles.formCard}>
          {(Object.keys(DOC_LABELS) as (keyof DocumentChecklist)[]).map((key) => {
            const complete = documents[key];
            return (
              <Pressable key={key} onPress={() => toggle(key)} style={styles.documentRow}>
                <Ionicons
                  color={complete ? Colors.success : Colors.text.muted}
                  name={complete ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                />
                <Text style={styles.documentText}>{DOC_LABELS[key]}</Text>
                <Text style={[styles.documentStatus, { color: complete ? Colors.success : Colors.text.secondary }]}>
                  {complete ? 'Ready' : 'Tap to add'}
                </Text>
              </Pressable>
            );
          })}
        </Card>

        <Button disabled={saving} title={saving ? 'Saving…' : 'Finish onboarding'} onPress={handleFinish} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  formCard: { gap: Spacing.md },
  documentRow: {
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 16,
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  documentText: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md },
  documentStatus: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
});
