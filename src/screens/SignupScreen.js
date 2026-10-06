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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { fonts } from '../config/fonts';
import Button from '../components/Button';
import { Field, Options } from '../components/ui';
import { apiClient } from '../services/api';
import { API_CONFIG } from '../config/apiConfig';
import { colors, spacing, typography, shadows, borderRadius } from '../config/theme';

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
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
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
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      const result = response.data;

      if (result.token && result.user) {
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Signup Failed', result.error || 'Unable to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to create account. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (text) => setFormData({ ...formData, [key]: text });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Logo size={40} style={{ marginBottom: spacing[5] }} />
        <Text style={styles.title}>Create your <Text style={styles.accent}>account</Text></Text>

        <View style={styles.pair}>
          <Field style={{ flex: 1 }} label="First name" value={formData.firstName} onChangeText={set('firstName')} autoCapitalize="words" />
          <Field style={{ flex: 1 }} label="Last name" value={formData.lastName} onChangeText={set('lastName')} autoCapitalize="words" />
        </View>
        <Field label="Email" value={formData.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Field label="Phone" value={formData.phone} onChangeText={set('phone')} keyboardType="phone-pad" hint="Email or phone is required." />

        <Options
          label="I am a"
          options={[
            { value: 'tenant', label: 'Tenant' },
            { value: 'landlord', label: 'Landlord' },
            { value: 'property_manager', label: 'Property manager' },
            { value: 'agent', label: 'Agent' },
            { value: 'vendor', label: 'Vendor' },
          ]}
          value={formData.role}
          onChange={(role) => setFormData({ ...formData, role })}
        />

        <Field label="Password" value={formData.password} onChangeText={set('password')} secureTextEntry autoCapitalize="none" hint="At least 8 characters." />
        <Field label="Confirm password" value={formData.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry autoCapitalize="none" />

        <Button title="Create account" onPress={handleSignup} loading={loading} disabled={loading} fullWidth size="lg" />

        <Button variant="ghost" onPress={() => navigation.replace('Login')} style={{ marginTop: spacing[4] }}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextBold}>Sign in</Text>
          </Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  accent: { fontFamily: fonts.serifItalic, fontWeight: '400', color: colors.leaf, letterSpacing: 0, fontSize: 38 },
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { flexGrow: 1, padding: spacing[6], paddingTop: 64, paddingBottom: 56 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.8, color: colors.textPrimary, marginBottom: spacing[6] },
  pair: { flexDirection: 'row', gap: spacing[3] },
  linkText: { color: colors.textSecondary, fontSize: typography.sm },
  linkTextBold: { color: colors.leaf, fontWeight: '600' },
});

export default SignupScreen;
