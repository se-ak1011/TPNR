import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';

const steps = [
  'Personal details',
  'Employment & income',
  'Lifestyle details',
  'Documents checklist',
];

export default function OnboardingStartScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Complete your Tenant Passport</Text>
        <Text style={styles.subtitle}>
          A strong passport helps agents move quickly. We&apos;ll guide you through the essentials in four short steps.
        </Text>

        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>What you&apos;ll finish today</Text>
          <ProgressBar current={0} label="Onboarding progress" total={4} />
          {steps.map((step, index) => (
            <Text key={step} style={styles.heroStep}>{index + 1}. {step}</Text>
          ))}
        </Card>

        <Button title="Start with personal details" onPress={() => router.push('/(applicant)/onboarding/personal')} />
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
    gap: Spacing.xl,
    padding: Spacing.lg,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    lineHeight: 42,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  heroCard: {
    gap: Spacing.md,
  },
  heroTitle: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  heroStep: {
    color: '#4D453D',
    fontSize: Typography.sizes.md,
  },
});
