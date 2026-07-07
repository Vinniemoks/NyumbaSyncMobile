import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { apiClient } from '../services/api';
import { API_CONFIG } from '../config/apiConfig';
import { colors, spacing, typography, commonStyles } from '../config/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: email.trim() });
      setSent(true);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send reset email. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={commonStyles.container}
    >
      <View style={commonStyles.content}>
        <Logo size={76} style={{ marginBottom: 20 }} />

        {!sent ? (
          <>
            <Text style={commonStyles.title}>Reset Password</Text>
            <Text style={commonStyles.subtitle}>
              Enter your email and we'll send you a link to reset your password.
            </Text>

            <View style={commonStyles.form}>
              <Text style={commonStyles.label}>Email Address</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="email@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Button
                title="Send Reset Link"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !email.trim()}
                fullWidth
                size="lg"
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.successIcon}>
              <Ionicons name="mail-outline" size={48} color={colors.success} />
            </View>
            <Text style={commonStyles.title}>Check Your Email</Text>
            <Text style={commonStyles.subtitle}>
              If your email is registered, you will receive a password reset link shortly.
            </Text>
            <Button
              title="Back to Sign In"
              onPress={() => navigation.replace('Login')}
              fullWidth
              size="lg"
            />
          </>
        )}

        <Button
          variant="ghost"
          onPress={() => navigation.replace('Login')}
          style={{ marginTop: spacing[4] }}
        >
          <Text style={styles.linkText}>
            Remembered your password? <Text style={styles.linkTextBold}>Sign In</Text>
          </Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.success}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  linkTextBold: {
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default ForgotPasswordScreen;