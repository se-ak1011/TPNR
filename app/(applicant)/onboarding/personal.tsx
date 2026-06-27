import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { upsertPassport, useCurrentApplicantData } from '@/lib/db';

export default function PersonalOnboardingScreen() {
  const router = useRouter();
  const { applicant: currentApplicant, loading } = useCurrentApplicantData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [saving, setSaving] = useState(false);

  const resolvedName = name || currentApplicant.passport.fullName;
  const resolvedEmail = email || currentApplicant.passport.email;
  const resolvedPhone = phone || currentApplicant.passport.phone;
  const resolvedAddress = address || currentApplicant.passport.currentAddress;
  const resolvedMoveInDate = moveInDate || currentApplicant.passport.desiredMoveInDate;

  const handleContinue = async () => {
    setSaving(true);
    await upsertPassport({
      fullName: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      currentAddress: resolvedAddress,
      desiredMoveInDate: resolvedMoveInDate,
    });
    setSaving(false);
    router.push('/(applicant)/onboarding/employment');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={1} label="Step 1 of 4" total={4} />
        <Text style={styles.title}>Personal details</Text>

        <Card style={styles.formCard}>
          <Input label="Full name" onChangeText={setName} value={resolvedName} />
          <Input autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} value={resolvedEmail} />
          <Input label="Phone" onChangeText={setPhone} value={resolvedPhone} />
          <Input label="Current address" multiline onChangeText={setAddress} value={resolvedAddress} />
          <Input label="Desired move-in date" onChangeText={setMoveInDate} value={resolvedMoveInDate} />
        </Card>

        <Button loading={saving} title="Continue to employment" onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background.primary,
    flex: 1,
  },
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
  },
  container: {
    gap: Spacing.lg,
    padding: Spacing.lg,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  formCard: {
    gap: Spacing.lg,
  },
});
