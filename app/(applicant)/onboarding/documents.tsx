import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentApplicant } from '@/data/mockData';

const labels = {
  photoId: 'Photo ID',
  proofOfAddress: 'Proof of address',
  bankStatements: 'Bank statements',
  employmentContract: 'Employment contract',
  payslips: 'Payslips',
  references: 'References',
};

export default function DocumentsOnboardingScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState(currentApplicant.passport.documents);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={4} label="Step 4 of 4" total={4} />
        <Text style={styles.title}>Documents checklist</Text>

        <Card style={styles.formCard}>
          {Object.entries(labels).map(([key, label]) => {
            const complete = documents[key as keyof typeof documents];
            return (
              <Pressable
                key={key}
                onPress={() => setDocuments((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))}
                style={styles.documentRow}>
                <View style={styles.documentInfo}>
                  <Ionicons color={complete ? Colors.success : Colors.text.muted} name={complete ? 'checkmark-circle' : 'ellipse-outline'} size={18} />
                  <Text style={styles.documentText}>{label}</Text>
                </View>
                <Text style={[styles.documentStatus, { color: complete ? Colors.success : Colors.text.secondary }]}>
                  {complete ? 'Ready' : 'Tap to add'}
                </Text>
              </Pressable>
            );
          })}
        </Card>

        <Button title="Finish onboarding" onPress={() => router.replace('/(applicant)/onboarding/complete')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background.primary,
    flex: 1,
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
});
