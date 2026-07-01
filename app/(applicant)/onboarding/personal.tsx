import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/auth';
import { fetchPassport, savePassportStep } from '@/lib/db';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function PersonalOnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPassport(user.id).then((p) => {
      if (!p) return;
      setName(p.fullName);
      setEmail(p.email);
      setPhone(p.phone);
      setAddress(p.currentAddress);
      setMoveInDate(p.desiredMoveInDate);
    });
  }, [user]);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    setSaving(true);
    await savePassportStep(user!.id, {
      full_name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      current_address: address.trim(),
      desired_move_in_date: moveInDate.trim(),
    });
    setSaving(false);
    router.push('/(applicant)/onboarding/employment');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <ProgressBar current={1} label="Step 1 of 4" total={4} />
        <Text style={styles.title}>Personal details</Text>
        <Card style={styles.formCard}>
          <Input label="Full name" onChangeText={setName} value={name} />
          <Input autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
          <Input label="Phone" keyboardType="phone-pad" onChangeText={setPhone} value={phone} />
          <Input label="Current address" multiline onChangeText={setAddress} value={address} />
          <Input label="Desired move-in date" onChangeText={setMoveInDate} placeholder="e.g. 2025-09-01" value={moveInDate} />
        </Card>
        <Button disabled={saving} title={saving ? 'Saving…' : 'Continue to employment'} onPress={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.lg, padding: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold },
  formCard: { gap: Spacing.lg },
});
