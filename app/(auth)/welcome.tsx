import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';

const highlights = [
  'Build one verified passport and share it with any landlord or agent.',
  'Document your home from day one so your deposit is always protected.',
  'Track maintenance, know your rights, and never lose evidence again.',
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Your renting companion</Text>
        <Text style={styles.title}>Renting shouldn&apos;t be this hard.</Text>
        <Text style={styles.subtitle}>
          One app for the whole journey — from application to moving out. Built for tenants, by someone who&apos;s been there.
        </Text>

        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroCardTitle}>What we do for you</Text>
          {highlights.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Ionicons color={Colors.accent.olive} name="checkmark-circle" size={18} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.actions}>
          <Button title="Log in" onPress={() => router.push('/(auth)/login')} />
          <Button title="Create account" onPress={() => router.push('/(auth)/signup')} variant="secondary" />
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
