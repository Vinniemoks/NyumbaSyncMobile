import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { colors, spacing, commonStyles } from '../config/theme';
import Button from '../components/Button';

// Shown after signing in with a temporary password (admin-created accounts).
// The one-time token from login is only good for /auth/change-password.
const ForcedPasswordChangeScreen = ({ navigation, route }) => {
  const { token } = route.params || {};
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!current || !next) return Alert.alert('Error', 'Fill in every field');
    if (next.length < 8) return Alert.alert('Error', 'Use at least 8 characters');
    if (next !== confirm) return Alert.alert('Error', 'The new passwords do not match');
    setLoading(true);
    try {
      await axios.post(
        `${API_CONFIG.BASE_URL}/auth/change-password`,
        { currentPassword: current, newPassword: next },
        { headers: { Authorization: `Bearer ${token}` }, timeout: API_CONFIG.TIMEOUT }
      );
      Alert.alert('Password changed', 'Sign in with your new password.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (e) {
      const d = e.response?.data;
      Alert.alert('Could not change password', [d?.error || d?.message, d?.hint].filter(Boolean).join('\n') || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, value, set) => (
    <>
      <Text style={commonStyles.label}>{label}</Text>
      <TextInput
        style={commonStyles.input}
        value={value}
        onChangeText={set}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.textMuted}
      />
    </>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={commonStyles.container}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>Choose a new password</Text>
        <Text style={commonStyles.subtitle}>
          You signed in with a temporary password. Enter it below, then pick one only you know.
        </Text>
        <View style={commonStyles.form}>
          {field('Temporary password', current, setCurrent)}
          {field('New password', next, setNext)}
          {field('Confirm new password', confirm, setConfirm)}
          <Button title="Change password" onPress={submit} loading={loading} style={{ marginTop: spacing[4] }} />
          <Button variant="ghost" title="Cancel" onPress={() => navigation.replace('Login')} style={{ marginTop: spacing[2] }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForcedPasswordChangeScreen;
