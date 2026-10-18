import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/components/ui';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          minHeight: 66,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23 }}>◉</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23 }}>≡</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 23 }}>⚙︎</Text>,
        }}
      />
    </Tabs>
  );
}
