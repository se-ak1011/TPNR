import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { fetchPassport, savePassportStep } from '@/lib/db';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

const EMPLOYMENT_OPTIONS = [
  { id: 'employed', label: 'Employed' },
  { id: 'self_employed', label: 'Self-employed' },
  { id: 'unemployed', label: 'Unemployed' },
  { id: 'student', label: 'Student' },
  { id: 'retired', label: 'Retired' },
] as const;

type EmploymentStatus = typeof EMPLOYMENT_OPTIONS[number]['id'];

export default function EmploymentOnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [employment, setEmployment] = useState<EmploymentStatus | null>(null);
  const [employer, setEmployer] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPassport(user.id).then((p) => {
      if (!p) return;
      if (p.employmentStatus) setEmployment(p.employmentStatus as EmploymentStatus);
      setEmployer(p.employer ?? '');
      setJobTitle(p.jobTitle ?? '');
      setIncome(p.annualIncome ? String(p.annualIncome) : '');
      setBudget(p.monthlyBudget ? String(p.monthlyBudget) : '');
    });
  }, [user]);

  const handleContinue = async () => {
    if (!employment) {
      Alert.alert('Required', 'Please select your employment status.');
      return;
    }
    setSaving(true);
    await savePassportStep(user!.id, {
      employment_status: employment,
      employer: employer.trim() || null,
      job_title: jobTitle.trim() || null,
      annual_income: income ? Number(income) : null,
      monthly_budget: budget ? Number(budget) : null,
    });
    setSaving(false);
    router.push('/(applicant)/onboarding/lifestyle');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={2} label="Step 2 of 4" total={4} />
        <Text style={styles.title}>Employment & income</Text>

        <Card style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Employment status</Text>
            <View style={styles.chipRow}>
              {EMPLOYMENT_OPTIONS.map((opt) => {
                const selected = employment === opt.id;
                return (
                  <Pressable key={opt.id} onPress={() => setEmployment(opt.id)} style={[styles.chip, selected && styles.chipSelected]}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Input label="Employer" onChangeText={setEmployer} value={employer} />
          <Input label="Job title" onChangeText={setJobTitle} value={jobTitle} />
          <Input keyboardType="numeric" label="Annual income (£)" onChangeText={setIncome} value={income} />
          <Input keyboardType="numeric" label="Monthly budget (£)" onChangeText={setBudget} value={budget} />
        </Card>

        <Button disabled={saving} title={saving ? 'Saving…' : 'Continue to lifestyle'} onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  formCard: { gap: Spacing.lg },
  fieldGroup: { gap: Spacing.sm },
  fieldLabel: { color: Colors.text.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  chipSelected: { backgroundColor: `${Colors.accent.gold}22`, borderColor: Colors.accent.gold },
  chipText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  chipTextSelected: { color: Colors.text.primary },
});
