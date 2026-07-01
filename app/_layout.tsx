import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { AuthProvider } from '@/context/auth';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.background.primary).catch(() => undefined);
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: Colors.background.primary },
        }}
      />
    </AuthProvider>
  );
}
