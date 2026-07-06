import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, commonStyles } from '../config/theme';
import Button from '../components/Button';

const STEPS = {
  SCAN: 1,
  BACKUP: 2,
};

const MFASetupScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const { user } = useAuth();

  const [step, setStep] = useState(STEPS.SCAN);
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initializeMFA();
  }, []);

  const initializeMFA = async () => {
    setInitializing(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/mfa/enable');
      const data = response.data?.data || response.data;
      setSecret(data?.secret || '');
      setBackupCodes(data?.backupCodes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start 2FA setup. Please try again.');
    } finally {
      setInitializing(false);
    }
  };

  const copySecret = async () => {
    if (!secret) return;
    await Clipboard.setStringAsync(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/mfa/verify', { token: verificationCode });
      setStep(STEPS.BACKUP);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = async () => {
    await Clipboard.setStringAsync(backupCodes.join('\n'));
    Alert.alert('Copied', 'Backup codes copied to clipboard');
  };

  const handleComplete = () => {
    Alert.alert(
      '2FA Enabled',
      'Your admin account is now protected with two-factor authentication.',
      [{ text: 'Continue', onPress: () => navigation.replace('AdminDashboard') }]
    );
  };

  const displayEmail = email || user?.email || 'your admin account';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={commonStyles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={40} color={colors.gold} />
          <Text style={styles.headerTitle}>Enable Two-Factor Authentication</Text>
          <Text style={styles.headerSubtitle}>
            Add an extra layer of security to {displayEmail}
          </Text>
        </View>

        {initializing ? (
          <View style={styles.card}>
            <Text style={styles.bodyText}>Setting up 2FA…</Text>
          </View>
        ) : step === STEPS.SCAN ? (
          <View style={styles.card}>
            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View>
                <Text style={styles.stepTitle}>Add to authenticator</Text>
                <Text style={styles.stepSubtitle}>
                  Use Google Authenticator, Microsoft Authenticator, or Authy.
                </Text>
              </View>
            </View>

            <View style={styles.secretBox}>
              <Text style={styles.label}>Manual entry key</Text>
              <View style={styles.secretRow}>
                <TextInput
                  style={styles.secretInput}
                  value={secret}
                  editable={false}
                  selectTextOnFocus
                />
                <TouchableOpacity onPress={copySecret} style={styles.copyButton}>
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy-outline'}
                    size={20}
                    color={colors.leaf}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                Tap the key above to select it, then paste it into your authenticator app.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enter the 6-digit code from your app</Text>
              <TextInput
                style={[commonStyles.input, styles.codeInput]}
                value={verificationCode}
                onChangeText={(value) => setVerificationCode(value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              title="Verify & Continue"
              onPress={handleVerify}
              loading={loading}
              disabled={verificationCode.length !== 6}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, styles.stepNumberDone]}>
                <Ionicons name="checkmark" size={18} color={colors.bg} />
              </View>
              <View>
                <Text style={styles.stepTitle}>Save your backup codes</Text>
                <Text style={styles.stepSubtitle}>
                  Each code can only be used once. Store them somewhere safe.
                </Text>
              </View>
            </View>

            <View style={styles.codesBox}>
              {backupCodes.map((code, index) => (
                <View key={index} style={styles.codePill}>
                  <Text style={styles.codePillText}>{code}</Text>
                </View>
              ))}
            </View>

            <Button
              variant="secondary"
              title="Copy Backup Codes"
              icon="copy-outline"
              onPress={copyBackupCodes}
              style={{ marginBottom: spacing[3] }}
            />

            <Button title="Complete Setup" onPress={handleComplete} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing[5],
    paddingTop: spacing[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  headerTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing[3],
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing[1],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
  },
  bodyText: {
    fontSize: typography.base,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.leafTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  stepNumberDone: {
    backgroundColor: colors.leaf,
  },
  stepNumberText: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.leafDeep,
  },
  stepTitle: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  secretBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[5],
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  secretRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secretInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.sm,
    marginRight: spacing[2],
  },
  copyButton: {
    padding: spacing[3],
    backgroundColor: colors.bg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: spacing[2],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  codeInput: {
    textAlign: 'center',
    fontSize: typography['2xl'],
    letterSpacing: 8,
    fontWeight: typography.fontWeight.bold,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.danger}15`,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sm,
    marginLeft: spacing[2],
    flex: 1,
  },
  codesBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[5],
  },
  codePill: {
    width: '48%',
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    margin: '1%',
    alignItems: 'center',
  },
  codePillText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.sm,
  },
});

export default MFASetupScreen;
