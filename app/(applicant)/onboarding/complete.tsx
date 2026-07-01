import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function OnboardingCompleteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
        </View>
        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.title}>Passport complete</Text>
          <Text style={styles.subtitle}>
            You&apos;re ready to send a polished tenant profile to agents, move faster, and keep every application organised.
          </Text>
        </Card>

        <Button title="Go to dashboard" onPress={() => router.replace('/(applicant)/dashboard')} />
        <Button title="Review passport" onPress={() => router.replace('/(applicant)/passport')} variant="secondary" />
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
    flexGrow: 1,
    gap: Spacing.lg,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  heroCard: {
    gap: Spacing.md,
  },
  title: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    color: '#4D453D',
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
});
