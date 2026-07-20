import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { completePassport, fetchPassport, uploadPassportDocument } from '@/lib/db';
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
  photoId: null,
  proofOfAddress: null,
  bankStatements: null,
  employmentContract: null,
  payslips: null,
  references: null,
};

const shortName = (path: string) => {
  const name = path.split('/').pop() ?? path;
  return name.length > 22 ? name.slice(0, 19) + '…' : name;
};

export default function DocumentsOnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentChecklist>(EMPTY_DOCS);
  const [uploading, setUploading] = useState<Partial<Record<keyof DocumentChecklist, boolean>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPassport(user.id).then((p) => {
      if (p?.documents) setDocs(p.documents);
    });
  }, [user]);

  const pick = async (key: keyof DocumentChecklist) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading((prev) => ({ ...prev, [key]: true }));
    const path = await uploadPassportDocument(
      user!.id,
      key,
      asset.uri,
      asset.name,
      asset.mimeType ?? 'application/octet-stream',
    );
    setUploading((prev) => ({ ...prev, [key]: false }));
    if (path) {
      setDocs((prev) => ({ ...prev, [key]: path }));
    } else {
      Alert.alert('Upload failed', 'Please try again.');
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await completePassport(user!.id);
    setSaving(false);
    router.replace('/(applicant)/onboarding/complete');
  };

  const keys = Object.keys(DOC_LABELS) as (keyof DocumentChecklist)[];
  const uploadedCount = keys.filter((k) => !!docs[k]).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={4} label="Step 4 of 4" total={4} />
        <Text style={styles.title}>Documents checklist</Text>
        <Text style={styles.subtitle}>
          All documents are optional — upload what you have ready now and add more later from your Passport tab.
        </Text>

        <Card style={styles.formCard}>
          {keys.map((key) => {
            const path = docs[key];
            const isUploading = uploading[key];
            return (
              <View key={key} style={styles.documentRow}>
                <View style={styles.left}>
                  <Ionicons
                    color={path ? Colors.success : Colors.text.muted}
                    name={path ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                  />
                  <View>
                    <Text style={styles.documentText}>{DOC_LABELS[key]}</Text>
                    {path && (
                      <Text style={styles.fileName}>{shortName(path)}</Text>
                    )}
                  </View>
                </View>
                <Pressable
                  disabled={isUploading}
                  onPress={() => pick(key)}
                  style={[styles.uploadBtn, path ? styles.uploadBtnDone : styles.uploadBtnEmpty]}>
                  <Text style={[styles.uploadBtnText, path ? styles.uploadBtnTextDone : styles.uploadBtnTextEmpty]}>
                    {isUploading ? 'Uploading…' : path ? 'Change' : 'Upload'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </Card>

        {uploadedCount > 0 && (
          <Text style={styles.hint}>{uploadedCount} of {keys.length} documents uploaded</Text>
        )}

        <Button disabled={saving} title={saving ? 'Saving…' : 'Finish onboarding'} onPress={handleFinish} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  formCard: { gap: 0 },
  documentRow: {
    alignItems: 'center',
    borderBottomColor: Colors.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  left: { alignItems: 'center', flexDirection: 'row', flex: 1, gap: Spacing.sm },
  documentText: { color: Colors.text.primary, fontSize: Typography.sizes.md },
  fileName: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, marginTop: 2 },
  uploadBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  uploadBtnEmpty: { borderColor: Colors.accent.gold },
  uploadBtnDone: { borderColor: Colors.border.default },
  uploadBtnText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  uploadBtnTextEmpty: { color: Colors.accent.gold },
  uploadBtnTextDone: { color: Colors.text.secondary },
  hint: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, textAlign: 'center' },
});
