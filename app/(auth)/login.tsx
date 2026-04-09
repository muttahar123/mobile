import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../api';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const loginFn = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await api.post('/api/auth/login', { email, password });
      await loginFn({ _id: res.data._id, name: res.data.name, email: res.data.email }, res.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary px-6 items-center justify-center">
      <View className="w-full max-w-sm">
        <Text className="text-4xl font-bold tracking-tight text-white mb-2">Welcome Back</Text>
        <Text className="text-gray-400 mb-8">Login to your tasks</Text>

        {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

        <View className="mb-4">
          <Text className="text-gray-300 font-medium mb-1">Email</Text>
          <TextInput
            className="w-full bg-secondary border border-gray-700 text-white rounded-xl px-4 py-3"
            placeholder="example@mail.com"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mb-8">
          <Text className="text-gray-300 font-medium mb-1">Password</Text>
          <TextInput
            className="w-full bg-secondary border border-gray-700 text-white rounded-xl px-4 py-3"
            placeholder="********"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl flex-row items-center justify-center shadow-lg"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">Log In</Text>
          )}
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="text-accent font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
