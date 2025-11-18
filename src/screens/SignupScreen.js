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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [otp, setOtp] = useState('');
  const { signup } = useAuth();

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      Alert.alert('Error', 'Please enter either email or phone number');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.phone && formData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('YOUR_API_URL/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('otp');
        Alert.alert(
          'Verification Code Sent',
          `A verification code has been sent to your ${formData.email ? 'email' : 'phone number'}`
        );
      } else {
        Alert.alert('Signup Failed', result.error || 'Unable to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
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
      const response = await fetch('YOUR_API_URL/auth/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          phone: formData.phone,
          otp 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', 'Account created successfully!');
        navigation.replace('Login');
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
    await handleSignup();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.title}>
            {step === 'details' ? 'Create Account' : 'Verify Your Account'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'details' 
              ? 'Join NyumbaSync today' 
              : 'Enter the verification code sent to you'}
          </Text>

          <View style={styles.form}>
            {step === 'details' ? (
              <>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#64748B"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#64748B"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#64748B"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={styles.label}>Phone Number (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+254712345678"
                  placeholderTextColor="#64748B"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>I am a *</Text>
                <View style={styles.roleContainer}>
                  {[
                    { value: 'tenant', label: 'Tenant', icon: '🏠' },
                    { value: 'landlord', label: 'Landlord', icon: '🏢' },
                    { value: 'property_manager', label: 'Property Manager', icon: '👔' },
                    { value: 'agent', label: 'Agent', icon: '🤝' },
                    { value: 'vendor', label: 'Vendor', icon: '🔧' },
                  ].map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleButton,
                        formData.role === role.value && styles.roleButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, role: role.value })}
                    >
                      <Text style={styles.roleIcon}>{role.icon}</Text>
                      <Text
                        style={[
                          styles.roleText,
                          formData.role === role.value && styles.roleTextActive,
                        ]}
                      >
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#64748B"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#64748B"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Text style={styles.helperText}>
                  * Required fields. You must provide either email or phone number.
                </Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
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
                    <Text style={styles.buttonText}>Verify & Complete Signup</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.otpActions}>
                  <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                    <Text style={styles.resendText}>Resend Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep('details')}>
                    <Text style={styles.backText}>Back to Form</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {step === 'details' && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
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
  helperText: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginBottom: 16,
    marginLeft: 4,
    fontStyle: 'italic',
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
    marginBottom: 40,
  },
  linkText: {
    color: '#94A3B8', // slate-400
    fontSize: 14,
  },
  linkTextBold: {
    color: '#818CF8', // indigo-400
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  roleButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  roleButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: '#312E81',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  roleTextActive: {
    color: '#A5B4FC',
    fontWeight: '600',
  },
});

export default SignupScreen;
