import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { currentApplicant } from '@/data/mockData';

export default function LifestyleOnboardingScreen() {
  const router = useRouter();
  const [hasPets, setHasPets] = useState(currentApplicant.passport.hasPets);
  const [hasChildren, setHasChildren] = useState(currentApplicant.passport.hasChildren);
  const [smoking, setSmoking] = useState(currentApplicant.passport.smokingStatus.replace('_', ' '));
  const [notes, setNotes] = useState(currentApplicant.passport.notesForAgent || '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={3} label="Step 3 of 4" total={4} />
        <Text style={styles.title}>Lifestyle details</Text>

        <Card style={styles.formCard}>
          <View style={styles.toggleGroup}>
            <Text style={styles.label}>Pets</Text>
            <View style={styles.toggleRow}>
              <Toggle label="No pets" selected={!hasPets} onPress={() => setHasPets(false)} />
              <Toggle label="Has pets" selected={hasPets} onPress={() => setHasPets(true)} />
            </View>
          </View>

          <View style={styles.toggleGroup}>
            <Text style={styles.label}>Children / dependants</Text>
            <View style={styles.toggleRow}>
              <Toggle label="None" selected={!hasChildren} onPress={() => setHasChildren(false)} />
              <Toggle label="Yes" selected={hasChildren} onPress={() => setHasChildren(true)} />
            </View>
          </View>

          <Input label="Smoking status" onChangeText={setSmoking} value={smoking} />
          <Input label="Notes for landlord or agent" multiline onChangeText={setNotes} value={notes} />
        </Card>

        <Button title="Continue to documents" onPress={() => router.push('/(applicant)/onboarding/documents')} />
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
});
