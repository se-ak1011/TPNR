import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { agentProperties } from '@/lib/db';

export default function PropertiesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Properties</Text>
        {agentProperties.map((property) => (
          <Pressable key={property.id} onPress={() => router.push(`/(agent)/properties/${property.id}`)}>
            <Card style={styles.card}>
              <Text style={styles.name}>{property.title}</Text>
              <Text style={styles.text}>{property.address}</Text>
              <Text style={styles.text}>£{property.monthlyRent.toLocaleString()} pcm • {property.bedrooms} bed • {property.bathrooms} bath</Text>
              <Badge label={`${property.applicants.length} active applicants`} color={Colors.accent.olive} />
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
