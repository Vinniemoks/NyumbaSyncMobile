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
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../config/theme';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter your email/phone and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/v1/auth/login', { identifier, password });
      const result = response.data;

      if (result.mfaRequired) {
        navigation.navigate('MFAVerify', { mfaSessionToken: result.mfaSessionToken });
        return;
      }

      if (result.success && result.token) {
        await login(result.token, result.user);
        const roleRoutes = {
          landlord: 'LandlordDashboard',
          manager: 'ManagerDashboard',
          tenant: 'TenantDashboard',
          admin: 'AdminDashboard',
        };
        navigation.replace(roleRoutes[result.user?.role] || 'TenantDashboard');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Please check your credentials.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={commonStyles.container}
    >
      <View style={commonStyles.content}>
        <Logo size={76} style={{ marginBottom: 20 }} />
        <Text style={commonStyles.title}>Welcome Back</Text>
        <Text style={commonStyles.subtitle}>Sign in with your email or phone number</Text>

        <View style={commonStyles.form}>
          <Text style={commonStyles.label}>Email or Phone Number</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="email@example.com or +254712345678"
            placeholderTextColor={colors.textMuted}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={commonStyles.label}>Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={handleForgotPassword}
          >
            <Text style={commonStyles.textLinkBold}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={commonStyles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={commonStyles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={commonStyles.linkButton}
            onPress={() => navigation.replace('Signup')}
          >
            <Text style={commonStyles.textLink}>
              Don't have an account? <Text style={commonStyles.textLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing[4],
  },
});

export default LoginScreen;
