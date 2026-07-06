import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, commonStyles } from '../config/theme';
import Button from '../components/Button';

const ROLE_ROUTES = {
  landlord: 'LandlordDashboard',
  manager: 'ManagerDashboard',
  tenant: 'TenantDashboard',
  admin: 'AdminDashboard',
};

const MFAVerifyScreen = ({ navigation, route }) => {
  const { mfaSessionToken, mfaMethod = 'totp' } = route.params || {};
  const { setAuthSession } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendNote, setResendNote] = useState(null);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const isEmailOtp = mfaMethod === 'email' || mfaMethod === 'email_whatsapp';
  const expectedLength = useBackupCode ? undefined : (isEmailOtp ? 8 : 6);

  useEffect(() => {
    if (!mfaSessionToken) {
      Alert.alert('Error', 'Invalid MFA session', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    }
  }, [mfaSessionToken, navigation]);

  const handleChange = (value) => {
    const digits = value.replace(/\D/g, '');
    setCode(useBackupCode ? value : digits.slice(0, expectedLength));
  };

  const goToDashboard = (user) => {
    const role = user?.role || 'tenant';
    navigation.replace(ROLE_ROUTES[role] || 'TenantDashboard');
  };

  const handleVerify = async () => {
    if (!mfaSessionToken) return;

    if (!useBackupCode && code.length !== expectedLength) {
      Alert.alert(
        'Invalid code',
        isEmailOtp
          ? 'Enter the 8-digit code from your email.'
          : 'Enter the 6-digit code from your authenticator app.'
      );
      return;
    }

    setLoading(true);
    try {
      const payload = { mfaSessionToken };
      if (useBackupCode) {
        payload.backupCode = code;
      } else if (isEmailOtp) {
        payload.emailOtp = code;
      } else {
        payload.token = code;
      }

      const response = await apiClient.post('/auth/mfa/verify-login', payload);
      const data = response.data;
      const accessToken = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken;
      const user = data?.user;

      if (!accessToken) {
        throw new Error(data?.message || 'Verification failed');
      }

      await setAuthSession({ token: accessToken, refreshToken, user });
      goToDashboard(user);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Verification failed. Please try again.';
      Alert.alert('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!mfaSessionToken) return;
    setResendLoading(true);
    try {
      const response = await apiClient.post('/auth/mfa/send-login-otp', { mfaSessionToken });
      setResendNote(response.data?.message || 'A new code has been sent to your email.');
      setTimeout(() => setResendNote(null), 6000);
    } catch (error) {
      const message = error.response?.data?.message || 'Could not resend the code.';
      Alert.alert('Error', message);
    } finally {
      setResendLoading(false);
    }
  };

  const title = useBackupCode
    ? 'Use a backup code'
    : isEmailOtp
    ? 'Email verification'
    : 'Two-factor authentication';

  const subtitle = useBackupCode
    ? 'Enter one of the backup codes you saved when setting up 2FA.'
    : isEmailOtp
    ? mfaMethod === 'email_whatsapp'
      ? 'Enter the 8-digit code we sent to your email and WhatsApp.'
      : 'Enter the 8-digit code we emailed you.'
    : 'Enter the 6-digit code from your authenticator app.';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={commonStyles.container}
    >
      <View style={commonStyles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={40} color={colors.gold} />
        </View>

        <Text style={commonStyles.title}>{title}</Text>
        <Text style={commonStyles.subtitle}>{subtitle}</Text>

        <View style={commonStyles.form}>
          <Text style={commonStyles.label}>
            {useBackupCode ? 'Backup code' : isEmailOtp ? 'Email code' : 'Authenticator code'}
          </Text>
          <TextInput
            style={[commonStyles.input, styles.codeInput]}
            value={code}
            onChangeText={handleChange}
            placeholder={useBackupCode ? 'XXXX-XXXX' : isEmailOtp ? '00000000' : '000000'}
            placeholderTextColor={colors.textMuted}
            keyboardType={useBackupCode ? 'default' : 'number-pad'}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={useBackupCode ? 16 : expectedLength}
          />

          {!useBackupCode && !isEmailOtp && (
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => {
                setUseBackupCode(true);
                setCode('');
              }}
            >
              <Text style={styles.toggleText}>Use a backup code instead</Text>
            </TouchableOpacity>
          )}

          {useBackupCode && (
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => {
                setUseBackupCode(false);
                setCode('');
              }}
            >
              <Text style={styles.toggleText}>Use authenticator code</Text>
            </TouchableOpacity>
          )}

          {resendNote && (
            <Text style={styles.resendNote}>{resendNote}</Text>
          )}

          {isEmailOtp && (
            <TouchableOpacity
              style={styles.resendRow}
              onPress={handleResend}
              disabled={resendLoading}
            >
              <Text style={styles.resendText}>
                {resendLoading ? 'Sending…' : "Didn't receive it? Resend code"}
              </Text>
            </TouchableOpacity>
          )}

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={!useBackupCode && code.length !== expectedLength}
            style={{ marginTop: spacing[4] }}
          />

          <Button
            variant="ghost"
            title="Cancel"
            onPress={() => navigation.replace('Login')}
            style={{ marginTop: spacing[2] }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.leaf}15`,
    borderWidth: 1,
    borderColor: `${colors.gold}40`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  codeInput: {
    textAlign: 'center',
    fontSize: typography['2xl'],
    letterSpacing: 8,
    fontWeight: typography.fontWeight.bold,
  },
  toggleRow: {
    alignSelf: 'flex-start',
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  toggleText: {
    color: colors.leaf,
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  resendRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing[4],
  },
  resendText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  resendNote: {
    color: colors.leaf,
    fontSize: typography.sm,
    marginBottom: spacing[4],
  },
});

export default MFAVerifyScreen;
