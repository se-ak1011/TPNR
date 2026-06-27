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

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: UserMode }>();
  const mode = params.mode === 'agent' ? 'agent' : 'applicant';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace(mode === 'agent' ? '/(agent)/dashboard' : '/(applicant)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue in {mode === 'agent' ? 'Estate Agent Mode' : 'Applicant Mode'}.
          </Text>
        </View>

        <Card style={styles.formCard}>
          <Input autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} placeholder="you@example.com" value={email} />
          <Input label="Password" onChangeText={setPassword} placeholder="••••••••" secureTextEntry value={password} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button loading={loading} title={mode === 'agent' ? 'Enter agent dashboard' : 'Open my dashboard'} onPress={handleLogin} />
          <Button title="Need an account? Sign up" onPress={() => router.replace(`/(auth)/signup?mode=${mode}`)} variant="ghost" />
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
});
