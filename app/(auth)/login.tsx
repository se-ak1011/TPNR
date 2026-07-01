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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Sign in failed', error);
      return;
    }
    router.replace('/(applicant)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your renter account.</Text>
        </View>

        <Card style={styles.formCard}>
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
            placeholder="••••••••"
            secureTextEntry
            value={password}
          />
          <Button disabled={loading} title={loading ? 'Signing in…' : 'Sign in'} onPress={handleLogin} />
          <Button
            title="Need an account? Sign up"
            onPress={() => router.replace('/(auth)/signup')}
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
