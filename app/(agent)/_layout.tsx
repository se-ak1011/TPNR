import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function AgentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background.primary },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: Colors.accent.oliveLight,
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
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="analytics-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="applicants/index"
        options={{
          title: 'Applicants',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="people-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="properties/index"
        options={{
          title: 'Properties',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="business-outline" size={size} />,
        }}
      />
      <Tabs.Screen name="applicants/[id]" options={{ href: null, title: 'Applicant Detail' }} />
      <Tabs.Screen name="properties/[id]" options={{ href: null, title: 'Property Detail' }} />
    </Tabs>
  );
}
