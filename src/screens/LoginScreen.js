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
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(''); // Email or phone number
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
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
        // Navigate to MFA verification if enabled
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
    Alert.alert(
      'Reset Password',
      'Enter your email address to receive a password reset link.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: async () => {
            if (!identifier) {
              Alert.alert('Error', 'Please enter your email address in the field above first.');
              return;
            }
            setLoading(true);
            try {
              await apiClient.post('/v1/auth/forgot-password', { email: identifier });
              Alert.alert('Success', 'If your email is registered, you will receive a reset link shortly.');
            } catch (error) {
              Alert.alert('Error', 'Failed to send reset email. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🏠</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in with your email or phone number</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email or Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com or +254712345678"
            placeholderTextColor="#64748B"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8', // slate-400
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0', // slate-200
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0F172A', // slate-900
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#F8FAFC', // slate-50
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#818CF8', // indigo-400
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6366F1', // indigo-500
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#94A3B8', // slate-400
    fontSize: 14,
  },
  linkTextBold: {
    color: '#818CF8', // indigo-400
    fontWeight: '600',
  },
});

export default LoginScreen;
