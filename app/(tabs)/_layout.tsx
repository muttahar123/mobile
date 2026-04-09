import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#141414', shadowColor: 'transparent', elevation: 0 },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1f1f1f',
          borderTopColor: '#374151',
          paddingBottom: 5,
        },
        tabBarActiveTintColor: '#FBBF24',
        tabBarInactiveTintColor: '#9ca3af',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={24} color="#f87171" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'New Task',
          tabBarIcon: ({ color }) => (
            <View style={{ backgroundColor: '#FBBF24', borderRadius: 20, padding: 2, marginTop: -15, shadowColor: '#FBBF24', shadowOpacity: 0.3, shadowRadius: 10 }}>
              <Ionicons name="add" size={28} color="#000" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
