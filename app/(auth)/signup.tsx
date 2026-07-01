import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      Alert.alert('Missing details', 'Please fill in all fields. Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error);
      return;
    }
    router.replace('/(applicant)/onboarding/personal');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Start your passport and move through the rental process with less friction.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input label="Full name" onChangeText={setName} placeholder="Your name" value={name} />
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <Input
            label="Password"
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            value={password}
          />
          <Button disabled={loading} title={loading ? 'Creating account…' : 'Start onboarding'} onPress={handleSignup} />
          <Button
            title="Already have an account? Log in"
            onPress={() => router.replace('/(auth)/login')}
            variant="ghost"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.background.primary, flex: 1 },
  container: { gap: Spacing.xl, padding: Spacing.lg, paddingTop: Spacing.xl },
  header: { gap: Spacing.sm },
  title: { color: Colors.text.primary, fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold },
  subtitle: { color: Colors.text.secondary, fontSize: Typography.sizes.md, lineHeight: 22 },
  formCard: { gap: Spacing.lg },
});
