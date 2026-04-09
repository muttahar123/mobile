import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/api/tasks', { title: title.trim(), description: description.trim(), status: 'pending' });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.container}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerIcon}>
            <Ionicons name="add-circle" size={28} color="#6d28d9" />
          </View>
          <Text style={s.title}>New Task</Text>
          <Text style={s.subtitle}>What do you want to accomplish?</Text>
        </View>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Title Input */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Title</Text>
          <View style={[s.inputWrapper, titleFocused && s.inputFocused]}>
            <Ionicons name="document-text-outline" size={18} color="#71717a" style={{ marginRight: 10 }} />
            <TextInput
              style={s.input}
              placeholder="e.g. Design review meeting"
              placeholderTextColor="#52525b"
              value={title}
              onChangeText={setTitle}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={s.inputGroup}>
          <Text style={s.label}>Description</Text>
          <View style={[s.descWrapper, descFocused && s.inputFocused]}>
            <TextInput
              style={s.descInput}
              placeholder="Add details, notes, or sub-tasks..."
              placeholderTextColor="#52525b"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          style={s.button}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={s.buttonInner}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.buttonText}>Save Task</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scroll: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: '#71717a',
    fontSize: 15,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#27272a',
  },
  inputFocused: {
    borderColor: '#6d28d9',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  descWrapper: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
    borderWidth: 1.5,
    borderColor: '#27272a',
  },
  descInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#6d28d9',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
