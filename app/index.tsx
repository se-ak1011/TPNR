import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Premium applicant screening, reimagined</Text>
          <Text style={styles.title}>Tenant Passport</Text>
          <Text style={styles.subtitle}>
            Build one trusted renter profile, share it instantly, and keep every decision moving.
          </Text>
        </View>

        <Card style={styles.selectorCard}>
          <Text style={styles.selectorTitle}>Choose your experience</Text>
          <Text style={styles.selectorText}>Switch into the workspace designed for your side of the rental journey.</Text>

          <Pressable style={styles.modeCard} onPress={() => router.push('/(auth)/welcome?mode=applicant')}>
            <View style={styles.modeIconWrap}>
              <Ionicons color={Colors.accent.gold} name="person-circle-outline" size={26} />
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>I&apos;m a Renter</Text>
              <Text style={styles.modeDescription}>
                Build your passport, complete onboarding, and track applications in one place.
              </Text>
            </View>
            <Ionicons color={Colors.text.secondary} name="chevron-forward" size={22} />
          </Pressable>

          <Pressable style={styles.modeCard} onPress={() => router.push('/(auth)/welcome?mode=agent')}>
            <View style={styles.modeIconWrap}>
              <Ionicons color={Colors.accent.oliveLight} name="business-outline" size={26} />
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>I&apos;m an Agent</Text>
              <Text style={styles.modeDescription}>
                Review richer profiles, manage applicant pipelines, and move faster on every let.
              </Text>
            </View>
            <Ionicons color={Colors.text.secondary} name="chevron-forward" size={22} />
          </Pressable>
        </Card>

        <View style={styles.footerRow}>
          <Card style={styles.footerCard} tone="muted">
            <Text style={styles.footerStat}>1 profile</Text>
            <Text style={styles.footerLabel}>Reusable across every property</Text>
          </Card>
          <Card style={styles.footerCard} tone="muted">
            <Text style={styles.footerStat}>7 statuses</Text>
            <Text style={styles.footerLabel}>Clear visibility from draft to accepted</Text>
          </Card>
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
  },
  hero: {
    gap: Spacing.md,
    paddingTop: Spacing.lg,
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
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.lg,
    lineHeight: 26,
  },
  selectorCard: {
    gap: Spacing.lg,
  },
  selectorTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.semibold,
  },
  selectorText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  modeCard: {
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.default,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  modeIconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  modeContent: {
    flex: 1,
    gap: 6,
  },
  modeTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  modeDescription: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footerCard: {
    flex: 1,
    gap: Spacing.sm,
  },
  footerStat: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  footerLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
