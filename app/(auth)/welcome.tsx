import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { agentModeHighlights, applicantModeHighlights } from '@/data/mockData';
import { UserMode } from '@/types';

export default function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: UserMode }>();
  const mode = params.mode === 'agent' ? 'agent' : 'applicant';
  const highlights = mode === 'agent' ? agentModeHighlights : applicantModeHighlights;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{mode === 'agent' ? 'Estate Agent Mode' : 'Applicant Mode'}</Text>
        <Text style={styles.title}>
          {mode === 'agent' ? 'Review better applicants, faster.' : 'Your renting profile, polished and ready.'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'agent'
            ? 'Tenant Passport gives agents a cleaner, faster way to shortlist renters with confidence.'
            : 'Create a premium tenant profile once, reuse it everywhere, and stop re-entering the same details.'}
        </Text>

        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroCardTitle}>{mode === 'agent' ? 'Why agents like it' : 'Why renters like it'}</Text>
          {highlights.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Ionicons color={Colors.accent.olive} name="checkmark-circle" size={18} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.actions}>
          <Button title="Log in" onPress={() => router.push(`/(auth)/login?mode=${mode}`)} />
          <Button title="Create account" onPress={() => router.push(`/(auth)/signup?mode=${mode}`)} variant="secondary" />
          <Button title="Back to mode select" onPress={() => router.back()} variant="ghost" />
        </View>
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
    paddingTop: Spacing.xl,
  },
  eyebrow: {
    color: Colors.accent.gold,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    lineHeight: 42,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.lg,
    lineHeight: 26,
  },
  heroCard: {
    gap: Spacing.md,
  },
  heroCardTitle: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  bulletRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bulletText: {
    color: Colors.text.inverse,
    flex: 1,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.md,
  },
});
