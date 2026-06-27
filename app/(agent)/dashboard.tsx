import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { agentProperties, allApplications, applicants } from '@/lib/db';

export default function AgentDashboardScreen() {
  const router = useRouter();
  const shortlisted = allApplications.filter((item) => item.status === 'shortlisted').length;
  const accepted = allApplications.filter((item) => item.status === 'accepted').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Agent dashboard</Text>
          <Text style={styles.subtitle}>Move from first enquiry to signed offer with clearer signals.</Text>
        </View>

        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>Today&apos;s pipeline</Text>
          <Text style={styles.heroText}>Four active properties, richer applicant data, and fewer back-and-forths.</Text>
          <View style={styles.heroStats}>
            <Text style={styles.heroStat}>{applicants.length} applicants</Text>
            <Text style={styles.heroStat}>{shortlisted} shortlisted</Text>
          </View>
        </Card>

        <View style={styles.grid}>
          <Card style={styles.statCard}><Text style={styles.statValue}>{agentProperties.length}</Text><Text style={styles.statLabel}>Active properties</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statValue}>{allApplications.length}</Text><Text style={styles.statLabel}>Applications</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statValue}>{shortlisted}</Text><Text style={styles.statLabel}>Shortlisted</Text></Card>
          <Card style={styles.statCard}><Text style={styles.statValue}>{accepted}</Text><Text style={styles.statLabel}>Accepted</Text></Card>
        </View>

        <View style={styles.actions}>
          <Button title="Review applicants" onPress={() => router.push('/(agent)/applicants')} />
          <Button title="View properties" onPress={() => router.push('/(agent)/properties')} variant="secondary" />
        </View>

        <Text style={styles.sectionTitle}>Featured properties</Text>
        {agentProperties.map((property) => (
          <Pressable key={property.id} onPress={() => router.push(`/(agent)/properties/${property.id}`)}>
            <Card style={styles.propertyCard}>
              <View style={styles.propertyHeader}>
                <View style={styles.propertyMeta}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>
                  <Text style={styles.propertyText}>{property.address}</Text>
                </View>
                <Badge label={`${property.applicants.length} applicants`} color={Colors.accent.olive} />
              </View>
              <Text style={styles.propertyText}>£{property.monthlyRent.toLocaleString()} pcm • Available {property.availableFrom}</Text>
            </Card>
          </Pressable>
        ))}
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
  header: {
    gap: Spacing.xs,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
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
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  heroText: {
    color: '#4D453D',
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  heroStat: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    gap: Spacing.xs,
    width: '47.5%',
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  statLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
  },
  actions: {
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
  },
  propertyCard: {
    gap: Spacing.md,
  },
  propertyHeader: {
    gap: Spacing.md,
  },
  propertyMeta: {
    gap: 4,
  },
  propertyTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  propertyText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
