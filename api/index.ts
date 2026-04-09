import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Using local network IP so physical devices via Expo Go can reach the backend
const DEV_URL = 'http://192.168.100.26:5000';

const api = axios.create({
  baseURL: DEV_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
