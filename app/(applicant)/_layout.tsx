import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ApplicantLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background.primary },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: Colors.accent.gold,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.background.secondary,
          borderTopColor: Colors.border.default,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="passport"
        options={{
          title: 'My Passport',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="document-text-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="applications/index"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="send-outline" size={size} />,
        }}
      />
      <Tabs.Screen name="applications/new" options={{ href: null, title: 'New Application' }} />
      <Tabs.Screen name="applications/[id]" options={{ href: null, title: 'Application Detail' }} />
      <Tabs.Screen name="onboarding/index" options={{ href: null, title: 'Onboarding' }} />
      <Tabs.Screen name="onboarding/personal" options={{ href: null, title: 'Personal Details' }} />
      <Tabs.Screen name="onboarding/employment" options={{ href: null, title: 'Employment' }} />
      <Tabs.Screen name="onboarding/lifestyle" options={{ href: null, title: 'Lifestyle' }} />
      <Tabs.Screen name="onboarding/documents" options={{ href: null, title: 'Documents' }} />
      <Tabs.Screen name="onboarding/complete" options={{ href: null, title: 'Complete' }} />
    </Tabs>
  );
}
