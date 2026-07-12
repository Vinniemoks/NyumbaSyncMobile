import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../services/api';
import { setSecure, getSecure, removeSecure, setPlain, getPlain, removePlain } from '../utils/secureStorage';

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
      const storedToken = await getSecure('nyumbasync_auth_token');
      const storedUser = await getPlain('nyumbasync_user_data');
      
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
      
      await setSecure('nyumbasync_auth_token', authToken);
      if (refreshToken) {
        await setSecure('nyumbasync_refresh_token', refreshToken);
      }
      await setPlain('nyumbasync_user_data', JSON.stringify(userData));

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
      
      await setSecure('nyumbasync_auth_token', authToken);
      if (refreshToken) {
        await setSecure('nyumbasync_refresh_token', refreshToken);
      }
      await setPlain('nyumbasync_user_data', JSON.stringify(newUser));

      setToken(authToken);
      setUser(newUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const setAuthSession = async ({ token: authToken, refreshToken, user: userData }) => {
    try {
      if (authToken) {
        await setSecure('nyumbasync_auth_token', authToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        setToken(authToken);
      }
      if (refreshToken) {
        await setSecure('nyumbasync_refresh_token', refreshToken);
      }
      if (userData) {
        await setPlain('nyumbasync_user_data', JSON.stringify(userData));
        setUser(userData);
      }
      return { success: true, user: userData };
    } catch (error) {
      console.error('Failed to set auth session:', error);
      return { success: false, error: 'Failed to save session' };
    }
  };

  const logout = async () => {
    try {
      await removeSecure('nyumbasync_auth_token');
      await removeSecure('nyumbasync_refresh_token');
      await removePlain('nyumbasync_user_data');
      setToken(null);
      setUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, setAuthSession, logout }}>
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
