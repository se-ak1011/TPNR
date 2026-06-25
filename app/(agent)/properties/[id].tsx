import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { agentProperties, applicants } from '@/data/mockData';

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = agentProperties.find((item) => item.id === id) || agentProperties[0];
  const propertyApplicants = applicants.filter((applicant) => property.applicants.includes(applicant.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Card tone="warm" style={styles.heroCard}>
          <Text style={styles.heroTitle}>{property.title}</Text>
          <Text style={styles.heroText}>{property.address}</Text>
          <Text style={styles.heroText}>£{property.monthlyRent.toLocaleString()} pcm • Available {property.availableFrom}</Text>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property notes</Text>
          <Text style={styles.sectionText}>{property.notes}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Applicant shortlist</Text>
        {propertyApplicants.map((applicant) => (
          <Pressable key={applicant.id} onPress={() => router.push(`/(agent)/applicants/${applicant.id}`)}>
            <Card style={styles.applicantCard}>
              <View style={styles.applicantHeader}>
                <View style={styles.meta}>
                  <Text style={styles.applicantName}>{applicant.passport.fullName}</Text>
                  <Text style={styles.sectionText}>{applicant.passport.jobTitle} • £{applicant.passport.annualIncome?.toLocaleString()} income</Text>
                </View>
                <Badge status={applicant.applications[0]?.status} />
              </View>
              <Text style={styles.sectionText}>Move-in target: {applicant.passport.desiredMoveInDate}</Text>
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
  heroCard: {
    gap: Spacing.sm,
  },
  heroTitle: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  heroText: {
    color: '#4D453D',
    fontSize: Typography.sizes.md,
  },
  sectionCard: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
  },
  sectionText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  applicantCard: {
    gap: Spacing.sm,
  },
  applicantHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  applicantName: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
});
