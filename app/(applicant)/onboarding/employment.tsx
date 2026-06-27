import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { upsertPassport, useCurrentApplicantData } from '@/lib/db';
import { TenantPassport } from '@/types';

const employmentStatuses: TenantPassport['employmentStatus'][] = ['employed', 'self_employed', 'unemployed', 'student', 'retired'];

function normalizeEmploymentStatus(value: string): TenantPassport['employmentStatus'] {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_') as TenantPassport['employmentStatus'];
  return employmentStatuses.includes(normalized) ? normalized : 'employed';
}

export default function EmploymentOnboardingScreen() {
  const router = useRouter();
  const { applicant: currentApplicant, loading } = useCurrentApplicantData();
  const [employment, setEmployment] = useState('');
  const [employer, setEmployer] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const resolvedEmployment = employment || currentApplicant.passport.employmentStatus.replace('_', ' ');
  const resolvedEmployer = employer || currentApplicant.passport.employer || '';
  const resolvedJobTitle = jobTitle || currentApplicant.passport.jobTitle || '';
  const resolvedIncome = income || String(currentApplicant.passport.annualIncome || '');
  const resolvedBudget = budget || String(currentApplicant.passport.monthlyBudget || '');

  const handleContinue = async () => {
    setSaving(true);
    await upsertPassport({
      employmentStatus: normalizeEmploymentStatus(resolvedEmployment),
      employer: resolvedEmployer,
      jobTitle: resolvedJobTitle,
      annualIncome: resolvedIncome ? Number(resolvedIncome) : undefined,
      monthlyBudget: resolvedBudget ? Number(resolvedBudget) : undefined,
    });
    setSaving(false);
    router.push('/(applicant)/onboarding/lifestyle');
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
        <ProgressBar current={2} label="Step 2 of 4" total={4} />
        <Text style={styles.title}>Employment & income</Text>

        <Card style={styles.formCard}>
          <Input hint="employed, self employed, unemployed, student, retired" label="Employment status" onChangeText={setEmployment} value={resolvedEmployment} />
          <Input label="Employer" onChangeText={setEmployer} value={resolvedEmployer} />
          <Input label="Job title" onChangeText={setJobTitle} value={resolvedJobTitle} />
          <Input keyboardType="numeric" label="Annual income" onChangeText={setIncome} value={resolvedIncome} />
          <Input keyboardType="numeric" label="Monthly budget" onChangeText={setBudget} value={resolvedBudget} />
        </Card>

        <Button loading={saving} title="Continue to lifestyle" onPress={handleContinue} />
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
    gap: Spacing.lg,
  },
});
