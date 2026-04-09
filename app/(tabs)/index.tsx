import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';

export default function TasksDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // For debounce
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchTasks = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1 && !isRefresh) setLoading(true);
      const res = await api.get('/api/tasks', {
        params: {
          page: pageNum,
          limit: 10,
          search: debouncedSearch,
          status,
        },
      });
      if (pageNum === 1) {
        setTasks(res.data.tasks);
      } else {
        setTasks((prev) => [...prev, ...res.data.tasks]);
      }
      setTotalPages(res.data.pages);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, [debouncedSearch, status]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks(1, true);
  }, [debouncedSearch, status]);

  const loadMore = () => {
    if (page < totalPages && !loading) {
      fetchTasks(page + 1);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error(error);
    }
  };

  const renderTask = ({ item }: { item: any }) => (
    <View className="bg-secondary rounded-2xl p-5 mb-4 border border-gray-800 shadow-sm flex-row items-center">
      <TouchableOpacity onPress={() => toggleTaskStatus(item._id, item.status)} className="mr-4">
        {item.status === 'completed' ? (
          <Ionicons name="checkmark-circle" size={28} color="#10b981" />
        ) : (
          <Ionicons name="ellipse-outline" size={28} color="#6b7280" />
        )}
      </TouchableOpacity>
      <View className="flex-1">
        <Text className={`text-lg font-semibold ${item.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
          {item.title}
        </Text>
        <Text className="text-gray-400 mt-1" numberOfLines={2}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-primary px-4 pt-12">
      <Text className="text-3xl font-bold text-white mb-6">My Tasks</Text>

      {/* Search and Filter */}
      <View className="flex-row items-center space-x-3 mb-6">
        <View className="flex-1 bg-secondary flex-row items-center px-4 rounded-xl border border-gray-800 h-12">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Search tasks..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <TouchableOpacity 
          onPress={() => setStatus(status === 'pending' ? '' : 'pending')}
          className={`h-12 px-4 rounded-xl justify-center border ${status === 'pending' ? 'bg-accent border-accent' : 'bg-secondary border-gray-800'}`}
        >
          <Text className={`${status === 'pending' ? 'text-black font-semibold' : 'text-white'}`}>Pending</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && page === 1 ? (
        <ActivityIndicator color="white" className="mt-10" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTask}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="document-text-outline" size={48} color="#4b5563" />
              <Text className="text-gray-400 text-lg mt-4">No tasks found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
