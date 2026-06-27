import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { saveDocumentPath, upsertPassport, useCurrentApplicantData } from '@/lib/db';
import { uploadPassportDocument } from '@/lib/storage';
import { DocumentChecklist } from '@/types';

const labels: Record<keyof DocumentChecklist, string> = {
  photoId: 'Photo ID',
  proofOfAddress: 'Proof of address',
  bankStatements: 'Bank statements',
  employmentContract: 'Employment contract',
  payslips: 'Payslips',
  references: 'References',
};

export default function DocumentsOnboardingScreen() {
  const router = useRouter();
  const { applicant: currentApplicant, loading } = useCurrentApplicantData();
  const [documents, setDocuments] = useState<DocumentChecklist | null>(null);
  const [uploadingKey, setUploadingKey] = useState<keyof DocumentChecklist | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedDocuments = documents ?? currentApplicant.passport.documents;
  const completedCount = useMemo(() => Object.values(resolvedDocuments).filter(Boolean).length, [resolvedDocuments]);

  const handleUpload = async (key: keyof DocumentChecklist) => {
    setError(null);
    setUploadingKey(key);

    try {
      const uploaded = await uploadPassportDocument(key);

      if (!uploaded) {
        setUploadingKey(null);
        return;
      }

      const nextDocuments = {
        ...resolvedDocuments,
        [key]: true,
      };

      setDocuments(nextDocuments);
      await Promise.all([saveDocumentPath(key, uploaded.path), upsertPassport({ documents: nextDocuments })]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleFinish = async () => {
    await upsertPassport({
      documents: resolvedDocuments,
      isComplete: Object.values(resolvedDocuments).every(Boolean),
      completedAt: new Date().toISOString().slice(0, 10),
    });

    router.replace('/(applicant)/onboarding/complete');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={4} label="Step 4 of 4" total={4} />
        <Text style={styles.title}>Documents checklist</Text>

        <Card style={styles.formCard}>
          {Object.entries(labels).map(([key, label]) => {
            const typedKey = key as keyof DocumentChecklist;
            const complete = resolvedDocuments[typedKey];
            const isUploading = uploadingKey === typedKey;

            return (
              <Pressable key={key} disabled={Boolean(uploadingKey)} onPress={() => handleUpload(typedKey)} style={styles.documentRow}>
                <View style={styles.documentInfo}>
                  <Ionicons color={complete ? Colors.success : Colors.text.muted} name={complete ? 'checkmark-circle' : 'ellipse-outline'} size={18} />
                  <Text style={styles.documentText}>{label}</Text>
                </View>
                <Text style={[styles.documentStatus, { color: complete ? Colors.success : Colors.text.secondary }]}>
                  {isUploading ? 'Uploading...' : complete ? 'Ready' : 'Tap to upload'}
                </Text>
              </Pressable>
            );
          })}
        </Card>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button title="Finish onboarding" onPress={handleFinish} />
        <Text style={styles.helperText}>Upload path format: {'{user_uid}/document-type-timestamp.ext'}</Text>
        <Text style={styles.helperText}>This matches your Supabase storage policy for the documents bucket.</Text>
        <Text style={styles.helperText}>Documents complete: {completedCount} / {Object.keys(labels).length}</Text>
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
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  formCard: {
    gap: Spacing.md,
  },
  documentRow: {
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  documentInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  documentText: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.md,
  },
  documentStatus: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  helperText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.xs,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: Typography.sizes.sm,
  },
});
