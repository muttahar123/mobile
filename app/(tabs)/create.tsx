import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../api';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!title) {
      setError('Title is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await api.post('/api/tasks', { title, description, status: 'pending' });
      // Go back to list and it will refresh on focus ideally, or just navigate
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary px-6 pt-10">
      <Text className="text-3xl font-bold text-white mb-8">Create New Task</Text>

      {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

      <View className="mb-6">
        <Text className="text-gray-300 font-medium mb-2">Task Title</Text>
        <TextInput
          className="w-full bg-secondary border border-gray-700 text-white rounded-xl px-4 py-4 text-lg"
          placeholder="e.g. Weekly Meeting"
          placeholderTextColor="#6b7280"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View className="mb-8">
        <Text className="text-gray-300 font-medium mb-2">Description</Text>
        <TextInput
          className="w-full bg-secondary border border-gray-700 text-white rounded-xl px-4 py-4 text-lg h-32"
          placeholder="Enter task details..."
          placeholderTextColor="#6b7280"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity 
        onPress={handleCreate}
        disabled={loading}
        className="w-full bg-accent active:bg-yellow-500 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-accent/20"
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black font-bold text-lg">Save Task</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
