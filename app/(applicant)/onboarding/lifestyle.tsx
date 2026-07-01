import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { fetchPassport, savePassportStep } from '@/lib/db';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const SMOKING_OPTIONS = [
  { id: 'non_smoker', label: 'Non-smoker' },
  { id: 'smoker', label: 'Smoker' },
  { id: 'outdoor_only', label: 'Outdoor only' },
] as const;

type SmokingStatus = typeof SMOKING_OPTIONS[number]['id'];

export default function LifestyleOnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasPets, setHasPets] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [smoking, setSmoking] = useState<SmokingStatus>('non_smoker');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPassport(user.id).then((p) => {
      if (!p) return;
      setHasPets(p.hasPets ?? false);
      setHasChildren(p.hasChildren ?? false);
      if (p.smokingStatus) setSmoking(p.smokingStatus as SmokingStatus);
      setNotes(p.notesForAgent ?? '');
    });
  }, [user]);

  const handleContinue = async () => {
    setSaving(true);
    await savePassportStep(user!.id, {
      has_pets: hasPets,
      has_children: hasChildren,
      smoking_status: smoking,
      notes_for_agent: notes.trim() || null,
    });
    setSaving(false);
    router.push('/(applicant)/onboarding/documents');
  };

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

          <View style={styles.toggleGroup}>
            <Text style={styles.label}>Smoking</Text>
            <View style={styles.toggleRow}>
              {SMOKING_OPTIONS.map((opt) => (
                <Toggle key={opt.id} label={opt.label} selected={smoking === opt.id} onPress={() => setSmoking(opt.id)} />
              ))}
            </View>
          </View>

          <Input label="Notes for landlord or agent" multiline onChangeText={setNotes} value={notes} />
        </Card>

        <Button disabled={saving} title={saving ? 'Saving…' : 'Continue to documents'} onPress={handleContinue} />
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
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  formCard: { gap: Spacing.lg },
  label: { color: Colors.text.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  toggleGroup: { gap: Spacing.sm },
  toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  toggle: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  toggleSelected: { backgroundColor: `${Colors.accent.gold}22`, borderColor: Colors.accent.gold },
  toggleText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  toggleTextSelected: { color: Colors.text.primary },
});
