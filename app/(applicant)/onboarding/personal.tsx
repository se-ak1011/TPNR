import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { currentApplicant } from '@/data/mockData';

export default function PersonalOnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState(currentApplicant.passport.fullName);
  const [email, setEmail] = useState(currentApplicant.passport.email);
  const [phone, setPhone] = useState(currentApplicant.passport.phone);
  const [address, setAddress] = useState(currentApplicant.passport.currentAddress);
  const [moveInDate, setMoveInDate] = useState(currentApplicant.passport.desiredMoveInDate);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={1} label="Step 1 of 4" total={4} />
        <Text style={styles.title}>Personal details</Text>

        <Card style={styles.formCard}>
          <Input label="Full name" onChangeText={setName} value={name} />
          <Input autoCapitalize="none" label="Email" onChangeText={setEmail} value={email} />
          <Input label="Phone" onChangeText={setPhone} value={phone} />
          <Input label="Current address" multiline onChangeText={setAddress} value={address} />
          <Input label="Desired move-in date" onChangeText={setMoveInDate} value={moveInDate} />
        </Card>

        <Button title="Continue to employment" onPress={() => router.push('/(applicant)/onboarding/employment')} />
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
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  formCard: {
    gap: Spacing.lg,
  },
});
