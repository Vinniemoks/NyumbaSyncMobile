import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { dashboardFor } from '../utils/roleRoutes';
import { colors, spacing, typography, commonStyles } from '../config/theme';
import Button from '../components/Button';


// Admins signing in from a new network confirm with the code we emailed.
const IpVerifyScreen = ({ navigation, route }) => {
  const { ipSessionToken, message } = route.params || {};
  const { setAuthSession } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/verify-ip', { ipSessionToken, code: code.trim() });
      if (!data?.token) throw new Error('Verification failed');
      await setAuthSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      navigation.replace(dashboardFor(data.user) || 'Landing');
    } catch (e) {
      const d = e.response?.data;
      Alert.alert('Verification failed', d?.error || d?.message || e.message || 'Please try again.', [
        // The code is burned after too many wrong guesses; sign in again.
        { text: 'OK', onPress: () => (e.response?.status === 429 || e.response?.status === 401) && navigation.replace('Login') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={commonStyles.container}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>New network detected</Text>
        <Text style={commonStyles.subtitle}>
          {(message || 'We sent you a code.') + ' Enter the 6-digit code to continue.'}
        </Text>
        <View style={commonStyles.form}>
          <TextInput
            style={[commonStyles.input, { fontSize: typography['2xl'], letterSpacing: code ? 8 : 0 }]}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="6-digit code"
            placeholderTextColor={colors.textMuted}
            maxLength={6}
          />
          <Button title="Verify" onPress={verify} loading={loading} disabled={code.length !== 6} style={{ marginTop: spacing[4] }} />
          <Button variant="ghost" title="Cancel" onPress={() => navigation.replace('Login')} style={{ marginTop: spacing[2] }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default IpVerifyScreen;
