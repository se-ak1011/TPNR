import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/auth';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: Colors.background.primary },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.background.primary).catch(() => undefined);
  }, []);

  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
