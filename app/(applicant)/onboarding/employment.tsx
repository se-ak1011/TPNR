import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentApplicant } from '@/data/mockData';

export default function EmploymentOnboardingScreen() {
  const router = useRouter();
  const [employment, setEmployment] = useState(currentApplicant.passport.employmentStatus.replace('_', ' '));
  const [employer, setEmployer] = useState(currentApplicant.passport.employer || '');
  const [jobTitle, setJobTitle] = useState(currentApplicant.passport.jobTitle || '');
  const [income, setIncome] = useState(String(currentApplicant.passport.annualIncome || ''));
  const [budget, setBudget] = useState(String(currentApplicant.passport.monthlyBudget || ''));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={2} label="Step 2 of 4" total={4} />
        <Text style={styles.title}>Employment & income</Text>

        <Card style={styles.formCard}>
          <Input label="Employment status" onChangeText={setEmployment} value={employment} />
          <Input label="Employer" onChangeText={setEmployer} value={employer} />
          <Input label="Job title" onChangeText={setJobTitle} value={jobTitle} />
          <Input keyboardType="numeric" label="Annual income" onChangeText={setIncome} value={income} />
          <Input keyboardType="numeric" label="Monthly budget" onChangeText={setBudget} value={budget} />
        </Card>

        <Button title="Continue to lifestyle" onPress={() => router.push('/(applicant)/onboarding/lifestyle')} />
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
    gap: Spacing.lg,
  },
});
