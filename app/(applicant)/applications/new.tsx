import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth';
import { createApplication } from '@/lib/db';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function NewApplicationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyRef, setPropertyRef] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (status: 'draft' | 'submitted') => {
    if (!propertyAddress.trim()) {
      Alert.alert('Required', 'Please enter the property address.');
      return;
    }
    setSaving(true);
    await createApplication(user!.id, {
      propertyAddress: propertyAddress.trim(),
      propertyRef: propertyRef.trim() || undefined,
      agencyName: agencyName.trim() || undefined,
      monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
      notes: notes.trim() || undefined,
      status,
    });
    setSaving(false);
    router.replace('/(applicant)/applications');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Add new application</Text>
          <Text style={styles.subtitle}>
            Capture the essentials now and update the status later as the process moves.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Property address"
            onChangeText={setPropertyAddress}
            placeholder="12 Regent Square, Manchester"
            value={propertyAddress}
          />
          <Input label="Property reference" onChangeText={setPropertyRef} placeholder="Optional" value={propertyRef} />
          <Input label="Agency name" onChangeText={setAgencyName} placeholder="Bridge Residential" value={agencyName} />
          <Input
            keyboardType="numeric"
            label="Monthly rent"
            onChangeText={setMonthlyRent}
            placeholder="1650"
            value={monthlyRent}
          />
          <Input
            label="Notes"
            multiline
            onChangeText={setNotes}
            placeholder="Add context for this application"
            value={notes}
          />
          <Button disabled={saving} title={saving ? 'Saving…' : 'Save draft'} onPress={() => save('draft')} />
          <Button
            disabled={saving}
            title="Mark as submitted"
            onPress={() => save('submitted')}
            variant="secondary"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.xl, padding: Spacing.lg },
  header: { gap: Spacing.sm },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  formCard: { gap: Spacing.lg },
});
