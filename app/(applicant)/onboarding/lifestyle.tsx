import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { upsertPassport, useCurrentApplicantData } from '@/lib/db';
import { TenantPassport } from '@/types';

const smokingStatuses: TenantPassport['smokingStatus'][] = ['non_smoker', 'smoker', 'outdoor_only'];

function normalizeSmokingStatus(value: string): TenantPassport['smokingStatus'] {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_') as TenantPassport['smokingStatus'];
  return smokingStatuses.includes(normalized) ? normalized : 'non_smoker';
}

export default function LifestyleOnboardingScreen() {
  const router = useRouter();
  const { applicant: currentApplicant, loading } = useCurrentApplicantData();
  const [hasPets, setHasPets] = useState<boolean | null>(null);
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [smoking, setSmoking] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedHasPets = hasPets ?? currentApplicant.passport.hasPets;
  const resolvedHasChildren = hasChildren ?? currentApplicant.passport.hasChildren;
  const resolvedSmoking = smoking || currentApplicant.passport.smokingStatus.replace('_', ' ');
  const resolvedNotes = notes || currentApplicant.passport.notesForAgent || '';

  const handleContinue = async () => {
    setSaving(true);
    setError(null);

    try {
      await upsertPassport({
      hasPets: resolvedHasPets,
      hasChildren: resolvedHasChildren,
      smokingStatus: normalizeSmokingStatus(resolvedSmoking),
      notesForAgent: resolvedNotes,
    });
      router.push('/(applicant)/onboarding/documents');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={3} label="Step 3 of 4" total={4} />
        <Text style={styles.title}>Lifestyle details</Text>

        <Card style={styles.formCard}>
          <View style={styles.toggleGroup}>
            <Text style={styles.label}>Pets</Text>
            <View style={styles.toggleRow}>
              <Toggle label="No pets" selected={!resolvedHasPets} onPress={() => setHasPets(false)} />
              <Toggle label="Has pets" selected={resolvedHasPets} onPress={() => setHasPets(true)} />
            </View>
          </View>

          <View style={styles.toggleGroup}>
            <Text style={styles.label}>Children / dependants</Text>
            <View style={styles.toggleRow}>
              <Toggle label="None" selected={!resolvedHasChildren} onPress={() => setHasChildren(false)} />
              <Toggle label="Yes" selected={resolvedHasChildren} onPress={() => setHasChildren(true)} />
            </View>
          </View>

          <Input hint="non smoker, smoker, outdoor only" label="Smoking status" onChangeText={setSmoking} value={resolvedSmoking} />
          <Input label="Notes for landlord or agent" multiline onChangeText={setNotes} value={resolvedNotes} />
        </Card>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button loading={saving} title="Continue to documents" onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Toggle({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggle, selected && styles.toggleSelected]}>
      <Text style={[styles.toggleText, selected && styles.toggleTextSelected]}>{label}</Text>
    </Pressable>
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
    gap: Spacing.lg,
  },
  label: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  toggleGroup: {
    gap: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  toggle: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  toggleSelected: {
    backgroundColor: `${Colors.accent.gold}22`,
    borderColor: Colors.accent.gold,
  },
  toggleText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  toggleTextSelected: {
    color: Colors.text.primary,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: Typography.sizes.sm,
  },
});
