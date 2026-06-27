import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { applicants } from '@/lib/db';

export default function ApplicantsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredApplicants = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return applicants;
    }

    return applicants.filter((applicant) => {
      return (
        applicant.passport.fullName.toLowerCase().includes(normalized) ||
        applicant.applications.some((application) => application.propertyAddress.toLowerCase().includes(normalized))
      );
    });
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Applicants</Text>
        <Input label="Search applicants" onChangeText={setQuery} placeholder="Search by name or property" value={query} />

        {filteredApplicants.length === 0 ? (
          <Card style={styles.card}>
            <Text style={styles.name}>No matches</Text>
            <Text style={styles.text}>Try another applicant name or property address.</Text>
          </Card>
        ) : null}

        {filteredApplicants.map((applicant) => (
          <Pressable key={applicant.id} onPress={() => router.push(`/(agent)/applicants/${applicant.id}`)}>
            <Card style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.meta}>
                  <Text style={styles.name}>{applicant.passport.fullName}</Text>
                  <Text style={styles.text}>{applicant.passport.jobTitle} • £{applicant.passport.annualIncome?.toLocaleString()} annual income</Text>
                </View>
                <Badge status={applicant.applications[0]?.status} />
              </View>
              <Text style={styles.text}>Move-in target: {applicant.passport.desiredMoveInDate}</Text>
              <Text style={styles.text}>{applicant.applications.length} active application(s)</Text>
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
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  card: {
    gap: Spacing.sm,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  text: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
