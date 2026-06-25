import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { UserMode } from '@/types';

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: UserMode }>();
  const mode = params.mode === 'agent' ? 'agent' : 'applicant';
  const [name, setName] = useState(mode === 'agent' ? 'Bridge Residential Team' : 'Maya Thompson');
  const [email, setEmail] = useState(mode === 'agent' ? 'team@bridgeresidential.co.uk' : 'maya.thompson@example.com');
  const [password, setPassword] = useState('password123');

  const handleSignup = () => {
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
          <Input autoCapitalize="none" label="Email" onChangeText={setEmail} placeholder="you@example.com" value={email} />
          <Input label="Password" onChangeText={setPassword} placeholder="Create a password" secureTextEntry value={password} />
          <Button title={mode === 'agent' ? 'Launch agent workspace' : 'Start onboarding'} onPress={handleSignup} />
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
});
