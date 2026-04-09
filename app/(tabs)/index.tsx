import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import api from '../../api';
import { useAuthStore } from '../../store/authStore';

export default function TasksDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const fetchTasks = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const params: any = { limit: 50 };
      if (filter !== 'all') params.status = filter;
      const res = await api.get('/api/tasks', { params });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [filter])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks(true);
  }, [filter]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error(error);
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setTasks(tasks.filter(t => t._id !== taskId));
      await api.delete(`/api/tasks/${taskId}`);
    } catch (error) {
      console.error(error);
      fetchTasks();
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const filters: Array<{ key: 'all' | 'pending' | 'completed'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'completed', label: 'Done', count: completedCount },
  ];

  const renderTask = ({ item }: { item: any }) => (
    <View style={s.taskCard}>
      <TouchableOpacity
        onPress={() => toggleTaskStatus(item._id, item.status)}
        style={s.checkboxArea}
        activeOpacity={0.7}
      >
        {item.status === 'completed' ? (
          <View style={s.checkboxDone}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        ) : (
          <View style={s.checkboxPending} />
        )}
      </TouchableOpacity>

      <View style={s.taskContent}>
        <Text style={[s.taskTitle, item.status === 'completed' && s.taskTitleDone]}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[s.taskDesc, item.status === 'completed' && s.taskDescDone]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={s.taskMeta}>
          <View style={[s.statusBadge, item.status === 'completed' ? s.badgeDone : s.badgePending]}>
            <Text style={[s.statusBadgeText, item.status === 'completed' ? s.badgeDoneText : s.badgePendingText]}>
              {item.status === 'completed' ? 'Completed' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteTask(item._id)} style={s.deleteBtn} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={18} color="#52525b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hi, {user?.name || 'there'} 👋</Text>
          <Text style={s.headerTitle}>Your Tasks</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { backgroundColor: '#1e1b4b' }]}>
          <Text style={s.statNumber}>{pendingCount}</Text>
          <Text style={s.statLabel}>Pending</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#052e16' }]}>
          <Text style={s.statNumber}>{completedCount}</Text>
          <Text style={s.statLabel}>Completed</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: '#18181b' }]}>
          <Text style={s.statNumber}>{tasks.length}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={s.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[s.filterPill, filter === f.key && s.filterPillActive]}
            activeOpacity={0.8}
          >
            <Text style={[s.filterPillText, filter === f.key && s.filterPillTextActive]}>
              {f.label}
            </Text>
            <View style={[s.filterCount, filter === f.key && s.filterCountActive]}>
              <Text style={[s.filterCountText, filter === f.key && s.filterCountTextActive]}>{f.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color="#6d28d9" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d28d9" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Ionicons name="checkmark-done-outline" size={48} color="#3f3f46" />
              </View>
              <Text style={s.emptyTitle}>No tasks yet</Text>
              <Text style={s.emptySubtitle}>Tap the + button below to create your first task</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: '#71717a',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#71717a',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 8,
  },
  filterPillActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterPillText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#09090b',
  },
  filterCount: {
    backgroundColor: '#27272a',
    borderRadius: 50,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterCountActive: {
    backgroundColor: '#09090b',
  },
  filterCountText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '700',
  },
  filterCountTextActive: {
    color: '#fff',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  checkboxArea: {
    marginRight: 16,
  },
  checkboxPending: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3f3f46',
    backgroundColor: '#27272a',
  },
  checkboxDone: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#6d28d9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  taskTitleDone: {
    color: '#52525b',
    textDecorationLine: 'line-through',
  },
  taskDesc: {
    color: '#71717a',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  taskDescDone: {
    color: '#3f3f46',
  },
  taskMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  badgePending: {
    backgroundColor: '#1e1b4b',
  },
  badgeDone: {
    backgroundColor: '#052e16',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgePendingText: {
    color: '#a78bfa',
  },
  badgeDoneText: {
    color: '#4ade80',
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#71717a',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
