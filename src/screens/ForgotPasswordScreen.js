import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Logo from '../components/Logo';
import { apiClient } from '../services/api';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../config/theme';

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
      await apiClient.post('/v1/auth/forgot-password', { email: email.trim() });
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

              <TouchableOpacity
                style={commonStyles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={commonStyles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
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
            <TouchableOpacity
              style={commonStyles.button}
              onPress={() => navigation.replace('Login')}
            >
              <Text style={commonStyles.buttonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={commonStyles.linkButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={commonStyles.textLink}>
            Remembered your password? <Text style={commonStyles.textLinkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
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
});

export default ForgotPasswordScreen;