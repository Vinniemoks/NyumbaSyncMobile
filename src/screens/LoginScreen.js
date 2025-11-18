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

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(''); // Email or phone number
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [tempAuthData, setTempAuthData] = useState(null);
  const { login } = useAuth();

  const handleSendOTP = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter your email/phone and password');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('YOUR_API_URL/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTempAuthData(result.data);
        setStep('otp');
        Alert.alert(
          'Verification Code Sent',
          `A verification code has been sent to your ${result.sentTo === 'email' ? 'email' : 'phone number'}`
        );
      } else {
        Alert.alert('Error', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('YOUR_API_URL/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier, 
          otp,
          sessionId: tempAuthData?.sessionId 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const loginResult = await login(result.token, result.user);
        
        if (loginResult.success) {
          const roleRoutes = {
            landlord: 'LandlordDashboard',
            manager: 'ManagerDashboard',
            tenant: 'TenantDashboard',
            admin: 'AdminDashboard',
          };
          navigation.replace(roleRoutes[result.user.role] || 'Login');
        }
      } else {
        Alert.alert('Error', result.error || 'Invalid verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handleSendOTP();
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen or show modal
    Alert.alert(
      'Reset Password',
      'Enter your email or phone number to receive a password reset code',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // TODO: Implement forgot password flow
            Alert.alert('Coming Soon', 'Password reset feature will be available soon');
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
        <Text style={styles.title}>
          {step === 'credentials' ? 'Welcome Back' : 'Verify Your Identity'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'credentials' 
            ? 'Sign in with your email or phone number' 
            : 'Enter the verification code sent to you'}
        </Text>

        <View style={styles.form}>
          {step === 'credentials' ? (
            <>
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
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#64748B"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.otpActions}>
                <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('credentials')}>
                  <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'credentials' && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          )}
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
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resendText: {
    color: '#818CF8', // indigo-400
    fontSize: 14,
    fontWeight: '600',
  },
  backText: {
    color: '#94A3B8', // slate-400
    fontSize: 14,
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
