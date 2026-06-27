import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { UserMode } from '@/types';

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: UserMode }>();
  const mode = params.mode === 'agent' ? 'agent' : 'applicant';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await signUp(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.needsEmailVerification) {
      setSuccessMessage('Account created. Check your email to verify, then log in.');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace(mode === 'agent' ? '/(agent)/dashboard' : '/(applicant)/onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            {mode === 'agent'
              ? 'Set up your team workspace for applicant review and property tracking.'
              : 'Start your passport and move through the rental process with less friction.'}
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input label={mode === 'agent' ? 'Agency or team name' : 'Full name'} onChangeText={setName} placeholder="Your name" value={name} />
          <Input autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} placeholder="you@example.com" value={email} />
          <Input label="Password" onChangeText={setPassword} placeholder="Create a password" secureTextEntry value={password} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
          <Button loading={loading} title={mode === 'agent' ? 'Launch agent workspace' : 'Start onboarding'} onPress={handleSignup} />
          <Button title="Already have an account? Log in" onPress={() => router.replace(`/(auth)/login?mode=${mode}`)} variant="ghost" />
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
    paddingTop: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
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
  formCard: {
    gap: Spacing.lg,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: Typography.sizes.sm,
  },
  successText: {
    color: Colors.success,
    fontSize: Typography.sizes.sm,
  },
});
