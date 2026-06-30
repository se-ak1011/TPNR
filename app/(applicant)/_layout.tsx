import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function TenantLayout() {
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="passport"
        options={{
          title: 'Passport',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="id-card-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-home"
        options={{
          title: 'My Home',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="shield-checkmark-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="moving"
        options={{
          title: 'Moving',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="checkbox-outline" size={size} />,
        }}
      />

      {/* Hidden: passport section */}
      <Tabs.Screen name="applications/index" options={{ href: null, title: 'Applications' }} />
      <Tabs.Screen name="applications/new" options={{ href: null, title: 'New Application' }} />
      <Tabs.Screen name="applications/[id]" options={{ href: null, title: 'Application Detail' }} />
      <Tabs.Screen name="onboarding/index" options={{ href: null }} />
      <Tabs.Screen name="onboarding/personal" options={{ href: null, title: 'Personal Details' }} />
      <Tabs.Screen name="onboarding/employment" options={{ href: null, title: 'Employment' }} />
      <Tabs.Screen name="onboarding/lifestyle" options={{ href: null, title: 'Lifestyle' }} />
      <Tabs.Screen name="onboarding/documents" options={{ href: null, title: 'Documents' }} />
      <Tabs.Screen name="onboarding/complete" options={{ href: null, title: 'Complete' }} />

      {/* Hidden: my home section */}
      <Tabs.Screen name="home/inventory" options={{ href: null, title: 'Inventory' }} />
      <Tabs.Screen name="home/maintenance" options={{ href: null, title: 'Maintenance' }} />
      <Tabs.Screen name="home/maintenance-new" options={{ href: null, title: 'Log Issue' }} />
      <Tabs.Screen name="home/documents" options={{ href: null, title: 'Documents' }} />
      <Tabs.Screen name="home/contacts" options={{ href: null, title: 'Contacts' }} />

      {/* Hidden: moving section */}
      <Tabs.Screen name="moving/checklist" options={{ href: null, title: 'Moving Checklist' }} />
      <Tabs.Screen name="moving/deposit" options={{ href: null, title: 'Deposit Tracker' }} />
      <Tabs.Screen name="moving/dispute" options={{ href: null, title: 'Dispute Guide' }} />
    </Tabs>
  );
}
