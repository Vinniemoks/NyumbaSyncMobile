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
import Button from '../components/Button';
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Logo size={76} showWordmark style={{ marginBottom: spacing[6] }} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join NyumbaSync today</Text>

          <View style={styles.form}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor={colors.textMuted}
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor={colors.textMuted}
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor={colors.textMuted}
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
              placeholderTextColor={colors.textMuted}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>I am a *</Text>
            <View style={styles.roleContainer}>
              {[
                { value: 'tenant', label: 'Tenant', icon: 'home' },
                { value: 'landlord', label: 'Landlord', icon: 'business' },
                { value: 'property_manager', label: 'Property Manager', icon: 'clipboard' },
                { value: 'agent', label: 'Agent', icon: 'briefcase' },
                { value: 'vendor', label: 'Vendor', icon: 'construct' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    formData.role === role.value && styles.roleButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: role.value })}
                >
                  <Ionicons
                    name={role.icon}
                    size={22}
                    color={formData.role === role.value ? colors.gold : colors.textMuted}
                    style={styles.roleIcon}
                  />
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
              placeholder="Minimum 8 characters"
              placeholderTextColor={colors.textMuted}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.textMuted}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.helperText}>
              * Required fields. You must provide either email or phone number.
            </Text>

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              fullWidth
              size="lg"
            />

            <Button
              variant="ghost"
              onPress={() => navigation.replace('Login')}
              style={{ marginTop: spacing[4] }}
            >
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing[8],
    textAlign: 'center',
    paddingHorizontal: spacing[5],
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  helperText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing[4],
    marginLeft: spacing[1],
    fontStyle: 'italic',
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  linkTextBold: {
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  roleButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  roleButtonActive: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}12`,
  },
  roleIcon: {
    marginBottom: spacing[1],
  },
  roleText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  roleTextActive: {
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default SignupScreen;
