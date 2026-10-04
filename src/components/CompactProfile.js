import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { roleLabel, fullName } from '../utils/roles';
import { checkAndOffer } from './UpdatePrompt';
import { installedVersion, installedBuild } from '../services/appUpdate';

const errText = (e, fallback) =>
  [e?.response?.data?.error || e?.response?.data?.message, e?.response?.data?.hint].filter(Boolean).join('\n') || fallback;

/**
 * One-screen profile for every role: who you are, Log out at the top, and a
 * grid of tiles that all do something. No scrolling.
 *
 * `extraTiles`: [{ icon, title, subtitle?, onPress }] added after the shared ones.
 */
const CompactProfile = ({ navigation, extraTiles = [] }) => {
  const { user, logout, setAuthSession } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const signOut = async () => {
    await logout();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Landing' }] }));
  };

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: signOut },
    ]);

  const tiles = [
    { icon: 'create-outline', title: 'Edit profile', subtitle: 'Your name', onPress: () => setEditing(true) },
    { icon: 'lock-closed-outline', title: 'Password', subtitle: 'Change it', onPress: () => setChangingPw(true) },
    { icon: 'shield-checkmark-outline', title: 'Authenticator', subtitle: 'Two-step sign-in', onPress: () => navigation.navigate('MFASetup') },
    { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Your alerts', onPress: () => navigation.navigate('Notifications') },
    ...extraTiles,
    {
      icon: 'cloud-download-outline',
      title: 'Updates',
      subtitle: `v${installedVersion() || '—'} · build ${installedBuild() || '—'}`,
      onPress: () => checkAndOffer({ manual: true }),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.top}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.firstName || user?.email || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{fullName(user)}</Text>
          <View style={styles.rolePill}><Text style={styles.roleText}>{roleLabel(user?.role)}</Text></View>
        </View>
        <TouchableOpacity style={styles.logout} onPress={confirmLogout} accessibilityRole="button" accessibilityLabel="Log out">
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Detail icon="mail-outline" text={user?.email} />
        {!!user?.phone && <Detail icon="call-outline" text={user.phone} />}
        {!!user?.accountNumber && <Detail icon="id-card-outline" text={user.accountNumber} />}
      </View>

      <View style={styles.grid}>
        {tiles.map((t) => (
          <TouchableOpacity key={t.title} style={styles.tile} onPress={t.onPress} activeOpacity={0.75} accessibilityRole="button">
            <View style={styles.tileIcon}><Ionicons name={t.icon} size={22} color={colors.primary} /></View>
            <Text style={styles.tileTitle} numberOfLines={1}>{t.title}</Text>
            {!!t.subtitle && <Text style={styles.tileSub} numberOfLines={1}>{t.subtitle}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <EditProfileModal
        visible={editing}
        user={user}
        onClose={() => setEditing(false)}
        onSaved={(patch) => setAuthSession({ user: { ...user, ...patch } })}
      />
      <ChangePasswordModal
        visible={changingPw}
        onClose={() => setChangingPw(false)}
        onChanged={async () => {
          setChangingPw(false);
          Alert.alert('Password changed', 'Sign in again with your new password.', [{ text: 'OK', onPress: signOut }]);
        }}
      />
    </SafeAreaView>
  );
};

const Detail = ({ icon, text }) => (
  <View style={styles.detail}>
    <Ionicons name={icon} size={14} color={colors.textMuted} />
    <Text style={styles.detailText} numberOfLines={1}>{text}</Text>
  </View>
);

const Sheet = ({ visible, title, onClose, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close"><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
        </View>
        {children}
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const Field = ({ label, ...props }) => (
  <View style={{ marginBottom: spacing[3] }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} autoCapitalize="none" autoCorrect={false} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

const SubmitButton = ({ busy, label, onPress }) => (
  <TouchableOpacity style={styles.submit} onPress={onPress} disabled={busy}>
    {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>{label}</Text>}
  </TouchableOpacity>
);

const EditProfileModal = ({ visible, user, onClose, onSaved }) => {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (visible) { setFirst(user?.firstName || ''); setLast(user?.lastName || ''); }
  }, [visible, user]);

  const save = async () => {
    if (!first.trim()) return Alert.alert('Name needed', 'Enter your first name.');
    setBusy(true);
    try {
      await profileService.update({ firstName: first.trim(), lastName: last.trim() });
      onSaved({ firstName: first.trim(), lastName: last.trim(), name: [first.trim(), last.trim()].filter(Boolean).join(' ') });
      onClose();
    } catch (e) {
      Alert.alert('Could not save', errText(e, 'Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} title="Edit profile" onClose={onClose}>
      <Field label="First name" value={first} onChangeText={setFirst} autoCapitalize="words" />
      <Field label="Last name" value={last} onChangeText={setLast} autoCapitalize="words" />
      <Text style={styles.hint}>Email and phone are changed by an administrator.</Text>
      <SubmitButton busy={busy} label="Save" onPress={save} />
    </Sheet>
  );
};

const ChangePasswordModal = ({ visible, onClose, onChanged }) => {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);

  React.useEffect(() => { if (visible) { setCur(''); setNext(''); setAgain(''); } }, [visible]);

  const save = async () => {
    if (!cur || !next) return Alert.alert('Missing details', 'Fill in every field.');
    if (next.length < 8) return Alert.alert('Too short', 'Use at least 8 characters.');
    if (next !== again) return Alert.alert('Not matching', 'The new passwords are different.');
    setBusy(true);
    try {
      await profileService.changePassword(cur, next);
      onChanged();
    } catch (e) {
      Alert.alert('Could not change password', errText(e, 'Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} title="Change password" onClose={onClose}>
      <Field label="Current password" value={cur} onChangeText={setCur} secureTextEntry />
      <Field label="New password" value={next} onChangeText={setNext} secureTextEntry />
      <Field label="Confirm new password" value={again} onChangeText={setAgain} secureTextEntry />
      <SubmitButton busy={busy} label="Change password" onPress={save} />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing[4] },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingTop: spacing[3] },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: typography.xl, fontWeight: '800' },
  name: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '800' },
  rolePill: { alignSelf: 'flex-start', backgroundColor: colors.leafTint, borderRadius: 999, paddingHorizontal: spacing[2], paddingVertical: 2, marginTop: 4 },
  roleText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  logout: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: 999, borderWidth: 1, borderColor: colors.danger + '55', backgroundColor: colors.surface,
  },
  logoutText: { color: colors.danger, fontWeight: '800', fontSize: typography.sm },
  details: {
    marginTop: spacing[3], padding: spacing[3], gap: 6, backgroundColor: colors.surface,
    borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
  },
  detail: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  detailText: { color: colors.textSecondary, fontSize: typography.sm, flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], marginTop: spacing[3] },
  tile: {
    width: '47.5%', padding: spacing[3], backgroundColor: colors.surface,
    borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
  },
  tileIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.leafTint, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  tileTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: typography.base },
  tileSub: { color: colors.textSecondary, fontSize: typography.xs, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(11,31,75,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing[4], paddingBottom: spacing[6] },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  sheetTitle: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '800' },
  label: { color: colors.textSecondary, fontSize: typography.xs, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3], paddingVertical: spacing[3], color: colors.textPrimary, fontSize: typography.base,
  },
  hint: { color: colors.textSecondary, fontSize: typography.xs, marginBottom: spacing[3] },
  submit: { backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingVertical: spacing[3], alignItems: 'center', marginTop: spacing[2] },
  submitText: { color: colors.white, fontWeight: '800', fontSize: typography.base },
});

export default CompactProfile;
