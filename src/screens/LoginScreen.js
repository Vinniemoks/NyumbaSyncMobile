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
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { normalizeKenyanPhone } from '../utils/phone';
import { colors, spacing, typography, commonStyles } from '../config/theme';
import MorphingBackground from '../components/MorphingBackground';

const ROLE_ROUTES = {
  landlord: 'LandlordDashboard',
  manager: 'ManagerDashboard',
  tenant: 'TenantDashboard',
  admin: 'AdminDashboard',
};

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthSession } = useAuth();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter your email/phone and password');
      return;
    }

    setLoading(true);
    try {
      // If the identifier looks like a phone number, normalize it to the
      // canonical 254XXXXXXXXX form so 07…, 01…, 254…, +254…, and bare 9-digit
      // inputs all resolve to the same account.
      const normalizedIdentifier = !identifier.includes('@')
        ? normalizeKenyanPhone(identifier) || identifier
        : identifier;

      const response = await apiClient.post('/auth/login', {
        identifier: normalizedIdentifier,
        password,
      });
      const result = response.data;

      if (result.mfaRequired) {
        navigation.navigate('MFAVerify', {
          mfaSessionToken: result.mfaSessionToken,
          mfaMethod: result.mfaMethod || 'totp',
        });
        return;
      }

      const adminRoles = ['admin', 'super_admin'];
      const isAdmin = adminRoles.includes(result.user?.role) ||
        (Array.isArray(result.user?.roles) && result.user.roles.some(r => adminRoles.includes(r)));

      if (result.requireMfaSetup && isAdmin) {
        // Admins must set up 2FA before accessing the dashboard.
        if (result.token) {
          await setAuthSession({
            token: result.token,
            refreshToken: result.refreshToken,
            user: result.user,
          });
        }
        navigation.navigate('MFASetup', { email: result.user?.email });
        return;
      }

      if (result.token && result.user) {
        await setAuthSession({
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.user,
        });
        const route = ROLE_ROUTES[result.user?.role] || 'TenantDashboard';
        navigation.replace(route);
      } else {
        Alert.alert('Error', result.message || result.error || 'Login failed');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Login failed. Please check your credentials.';
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
      <MorphingBackground />
      <View style={commonStyles.content}>
        <Logo size={80} showWordmark style={{ marginBottom: spacing[6] }} />
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

          <Text style={styles.forgotButton} onPress={handleForgotPassword}>
            Forgot Password?
          </Text>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={loading || !identifier || !password}
            fullWidth
            size="lg"
          />

          <Button
            variant="ghost"
            onPress={() => navigation.replace('Signup')}
            style={{ marginTop: spacing[4] }}
          >
            <Text style={styles.signUpText}>
              Don't have an account?{' '}
              <Text style={styles.signUpBold}>Sign Up</Text>
            </Text>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing[4],
    color: colors.leaf,
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  signUpText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  signUpBold: {
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default LoginScreen;
