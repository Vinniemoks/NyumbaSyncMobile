import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('nyumbasync_auth_token');
      const storedUser = await AsyncStorage.getItem('nyumbasync_user_data');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Backend login expects `identifier` (email OR phone), not `email`.
      const response = await apiClient.post('/auth/login', { identifier: email, password });
      const { token: authToken, refreshToken, user: userData } = response.data;
      
      await AsyncStorage.setItem('nyumbasync_auth_token', authToken);
      if (refreshToken) {
        await AsyncStorage.setItem('nyumbasync_refresh_token', refreshToken);
      }
      await AsyncStorage.setItem('nyumbasync_user_data', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      // Full registration that returns a token lives at /auth/signup.
      // /auth/register is the phone-OTP flow (no token, requires a verify step).
      const response = await apiClient.post('/auth/signup', userData);
      const { token: authToken, refreshToken, user: newUser } = response.data;
      
      await AsyncStorage.setItem('nyumbasync_auth_token', authToken);
      if (refreshToken) {
        await AsyncStorage.setItem('nyumbasync_refresh_token', refreshToken);
      }
      await AsyncStorage.setItem('nyumbasync_user_data', JSON.stringify(newUser));
      
      setToken(authToken);
      setUser(newUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'nyumbasync_auth_token',
        'nyumbasync_refresh_token',
        'nyumbasync_user_data',
      ]);
      setToken(null);
      setUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
