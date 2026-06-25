import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function NewApplicationScreen() {
  const router = useRouter();
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyRef, setPropertyRef] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Add new application</Text>
          <Text style={styles.subtitle}>Capture the essentials now and update the status later as the process moves.</Text>
        </View>

        <Card style={styles.formCard}>
          <Input label="Property address" onChangeText={setPropertyAddress} placeholder="12 Regent Square, Manchester" value={propertyAddress} />
          <Input label="Property reference" onChangeText={setPropertyRef} placeholder="Optional" value={propertyRef} />
          <Input label="Agency name" onChangeText={setAgencyName} placeholder="Bridge Residential" value={agencyName} />
          <Input keyboardType="numeric" label="Monthly rent" onChangeText={setMonthlyRent} placeholder="1650" value={monthlyRent} />
          <Input label="Notes" multiline onChangeText={setNotes} placeholder="Add context for this application" value={notes} />
          <Button title="Save draft" onPress={() => router.replace('/(applicant)/applications')} />
          <Button title="Submit and return" onPress={() => router.replace('/(applicant)/applications')} variant="secondary" />
        </Card>
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
  header: {
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
    lineHeight: 22,
  },
  formCard: {
    gap: Spacing.lg,
  },
});
