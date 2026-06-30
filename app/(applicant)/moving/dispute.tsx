import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/types/../constants/theme';

type Step = {
  number: number;
  title: string;
  body: string;
  action?: { label: string; url: string };
};

const steps: Step[] = [
  {
    number: 1,
    title: 'Check your deposit is protected',
    body: "Your landlord must protect your deposit in a government-backed scheme (DPS, TDS, or MyDeposits) within 30 days of receiving it, and give you details of the scheme. If they didn't, you may be owed 1–3× the deposit as compensation.",
    action: { label: 'Check DPS', url: 'https://www.depositprotection.com/is-my-deposit-protected' },
  },
  {
    number: 2,
    title: 'Gather your evidence',
    body: 'Strong disputes have evidence. Gather:\n· Move-in inventory with timestamped photos\n· Move-out photos (same rooms, same angles)\n· Any written communication with your landlord\n· Your tenancy agreement\n· Receipts for any cleaning or repairs you did',
  },
  {
    number: 3,
    title: 'Respond to the deduction notice',
    body: 'Your landlord must tell you what they plan to deduct before releasing your deposit. You have the right to dispute any deductions you believe are unfair. Respond in writing — do not agree to deductions verbally.',
  },
  {
    number: 4,
    title: 'Start the dispute with your scheme',
    body: "If you can't agree with your landlord, contact your deposit scheme and ask to open a formal dispute. You typically have 3 months from the end of the tenancy. Each scheme has a free adjudication service — an independent person reviews the evidence and makes a binding decision.",
    action: { label: 'Start TDS dispute', url: 'https://www.tenancydepositscheme.com/dispute-resolution/' },
  },
  {
    number: 5,
    title: 'Wait for adjudication',
    body: 'Adjudication typically takes 28 days. The adjudicator will review both sides of the evidence. On average, tenants who dispute recover 79% of the amount they challenge — it is almost always worth doing.',
  },
];

const rights: { title: string; detail: string }[] = [
  {
    title: 'Fair wear and tear is NOT chargeable',
    detail: 'Normal use of the property — minor scuffs, faded paint, worn carpets — cannot be deducted. Only damage beyond fair wear and tear can be claimed.',
  },
  {
    title: 'Professional cleaning cannot be required',
    detail: "Since the Tenant Fees Act 2019, landlords cannot require you to use a specific cleaning company. You only need to return the property in the same state it was in — not necessarily professionally cleaned.",
  },
  {
    title: 'Betterment is not allowed',
    detail: 'If a landlord replaces a 10-year-old carpet, they cannot charge you full replacement cost. The adjudicator will factor in the remaining useful life of the item.',
  },
  {
    title: 'You have 3 months to raise a dispute',
    detail: 'After the tenancy ends, you have up to 3 months to raise a formal dispute with the deposit scheme — even if your landlord has already claimed the money.',
  },
];

const schemes = [
  { name: 'DPS', label: 'Deposit Protection Service', url: 'https://www.depositprotection.com', color: Colors.accent.olive },
  { name: 'TDS', label: 'Tenancy Deposit Scheme', url: 'https://www.tenancydepositscheme.com', color: Colors.accent.gold },
  { name: 'MyDeposits', label: 'mydeposits', url: 'https://www.mydeposits.co.uk', color: '#4A90D9' },
];

export default function DisputeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Deposit Dispute Guide</Text>
          <Text style={styles.subtitle}>
            46% of tenants don&apos;t know they can challenge deductions. Those who do get 79% back on average.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Step-by-step</Text>

        {steps.map((step) => (
          <Card key={step.number} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepBody}>{step.body}</Text>
            {step.action && (
              <Pressable onPress={() => Linking.openURL(step.action!.url)} style={styles.actionLink}>
                <Text style={styles.actionLinkText}>{step.action.label}</Text>
                <Ionicons color={Colors.accent.gold} name="open-outline" size={14} />
              </Pressable>
            )}
          </Card>
        ))}

        <Text style={styles.sectionLabel}>Your rights</Text>

        {rights.map((right) => (
          <Card key={right.title} style={styles.rightCard}>
            <View style={styles.rightHeader}>
              <Ionicons color={Colors.accent.olive} name="shield-checkmark" size={18} />
              <Text style={styles.rightTitle}>{right.title}</Text>
            </View>
            <Text style={styles.rightDetail}>{right.detail}</Text>
          </Card>
        ))}

        <Text style={styles.sectionLabel}>Contact your scheme</Text>

        {schemes.map((scheme) => (
          <Pressable key={scheme.name} onPress={() => Linking.openURL(scheme.url)}>
            <Card style={styles.schemeCard}>
              <View style={[styles.schemeBadge, { borderColor: scheme.color }]}>
                <Text style={[styles.schemeName, { color: scheme.color }]}>{scheme.name}</Text>
              </View>
              <View style={styles.schemeContent}>
                <Text style={styles.schemeLabel}>{scheme.label}</Text>
                <Text style={styles.schemeUrl}>Open website →</Text>
              </View>
            </Card>
          </Pressable>
        ))}

        <Card style={styles.shelterCard} tone="muted">
          <View style={styles.shelterHeader}>
            <Ionicons color={Colors.accent.gold} name="information-circle-outline" size={18} />
            <Text style={styles.shelterTitle}>Need more help?</Text>
          </View>
          <Text style={styles.shelterText}>
            Shelter and Citizens Advice both offer free, specialist housing advice. If your landlord hasn&apos;t protected
            your deposit at all, you may be entitled to 1–3× the deposit as a penalty.
          </Text>
          <Pressable onPress={() => Linking.openURL('https://england.shelter.org.uk/housing_advice/deposits')}>
            <Text style={styles.shelterLink}>Shelter deposit advice →</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  header: { gap: Spacing.xs },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  sectionLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stepCard: { gap: Spacing.md },
  stepHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: Colors.accent.gold,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepNumberText: { color: Colors.text.inverse, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  stepTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  stepBody: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 22 },
  actionLink: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  actionLinkText: { color: Colors.accent.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  rightCard: { gap: Spacing.sm },
  rightHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.sm },
  rightTitle: { color: Colors.text.primary, flex: 1, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  rightDetail: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  schemeCard: { alignItems: 'center', flexDirection: 'row', gap: Spacing.md },
  schemeBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  schemeName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  schemeContent: { flex: 1, gap: 3 },
  schemeLabel: { color: Colors.text.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  schemeUrl: { color: Colors.accent.gold, fontSize: Typography.sizes.xs },
  shelterCard: { gap: Spacing.md },
  shelterHeader: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm },
  shelterTitle: { color: Colors.text.primary, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
  shelterText: { color: Colors.text.secondary, fontSize: Typography.sizes.sm, lineHeight: 20 },
  shelterLink: { color: Colors.accent.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
});
