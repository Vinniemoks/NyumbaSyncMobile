import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../config/theme';
import { ROLE_ORDER, ADMIN_LEVEL_ROLES, roleLabel, isAdminLevel, fullName } from '../../utils/roles';
import { normalizeKenyanPhone } from '../../utils/phone';

const GROUPS = [
  { key: 'all', label: 'All', role: undefined },
  { key: 'admins', label: 'Admins', role: ADMIN_LEVEL_ROLES.join(',') },
  { key: 'manager', label: 'Managers', role: 'manager' },
  { key: 'landlord', label: 'Landlords', role: 'landlord' },
  { key: 'agent', label: 'Agents', role: 'agent' },
  { key: 'vendor', label: 'Vendors', role: 'vendor' },
  { key: 'tenant', label: 'Tenants', role: 'tenant' },
];
const STATUSES = [
  { key: undefined, label: 'Any status' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'inactive', label: 'Inactive' },
];
const PAGE = 20;

const statusColor = (s) =>
  s === 'active' ? colors.success : s === 'suspended' ? colors.danger : colors.textMuted;

const errText = (e, fallback) => e?.response?.data?.error || e?.response?.data?.message || fallback;

const AdminUsersScreen = () => {
  const { user: me } = useAuth();
  const meRoles = [me?.role, ...(Array.isArray(me?.roles) ? me.roles : [])];
  const iAmSuper = meRoles.includes('super_admin');

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [group, setGroup] = useState('all');
  const [status, setStatus] = useState(undefined);

  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);

  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (nextPage = 1, mode = 'replace') => {
      const id = ++reqId.current;
      if (mode === 'replace' && nextPage === 1) setLoading((l) => l);
      try {
        const g = GROUPS.find((x) => x.key === group);
        const { data } = await adminService.listUsers({
          page: nextPage,
          limit: PAGE,
          search: debounced || undefined,
          role: g?.role,
          status,
        });
        if (id !== reqId.current) return; // a newer request superseded this one
        setError(null);
        setUsers((prev) => (nextPage === 1 ? data.users : [...prev, ...data.users]));
        setTotal(data.total || 0);
        setPage(data.page || nextPage);
        setPages(data.pages || 1);
      } catch (e) {
        if (id !== reqId.current) return;
        setError(errText(e, 'Could not load users. Check your connection and try again.'));
      } finally {
        if (id === reqId.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [debounced, group, status]
  );

  useEffect(() => {
    setLoading(true);
    load(1);
  }, [load]);

  const onEnd = () => {
    if (loadingMore || loading || page >= pages) return;
    setLoadingMore(true);
    load(page + 1);
  };

  const patchLocal = (updated) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => setSelected(item)} activeOpacity={0.6}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{fullName(item)}</Text>
        <Text style={styles.sub} numberOfLines={1}>{item.email}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', marginLeft: spacing[3] }}>
        <Text style={styles.roleText}>{roleLabel(item.role)}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor(item.status) }]} />
          <Text style={styles.statusText}>
            {item.activationPending && item.status === 'active' ? 'Awaiting activation' : item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search users"
          placeholder="Search name, email or phone"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setCreating(true)} accessibilityLabel="Create user" hitSlop={8}>
          <Text style={styles.newLink}>New user</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.chips}>
        {GROUPS.map((g) => (
          <Chip key={g.key} label={g.label} active={group === g.key} onPress={() => setGroup(g.key)} />
        ))}
      </ScrollView>
      <View style={styles.statusLine}>
        {STATUSES.map((s) => (
          <Chip key={String(s.key)} small label={s.label} active={status === s.key} onPress={() => setStatus(s.key)} />
        ))}
        <Text style={styles.count}>{total} user{total === 1 ? '' : 's'}</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.info} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); load(1); }} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: spacing[8] }}
          onEndReached={onEnd}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(1); }} tintColor={colors.textPrimary} />
          }
          ListEmptyComponent={<Text style={[styles.empty, { marginTop: spacing[10] }]}>No users match.</Text>}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: spacing[4] }} color={colors.info} /> : null}
        />
      )}

      <UserSheet
        user={selected}
        me={me}
        iAmSuper={iAmSuper}
        onClose={() => setSelected(null)}
        onChanged={(u) => { patchLocal(u); setSelected((s) => (s ? { ...s, ...u } : s)); }}
      />
      <CreateUserModal
        visible={creating}
        iAmSuper={iAmSuper}
        onClose={() => setCreating(false)}
        onCreated={() => { setLoading(true); load(1); }}
      />
    </View>
  );
};

const Chip = ({ label, active, onPress, small }) => (
  <TouchableOpacity
    onPress={onPress}
    style={small ? styles.statusOpt : [styles.tab, active && styles.tabOn]}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <Text style={[small ? styles.statusOptText : styles.tabText, active && styles.tabTextOn]}>{label}</Text>
  </TouchableOpacity>
);

/* ── User detail + admin actions ─────────────────────────────────────── */

const UserSheet = ({ user, me, iAmSuper, onClose, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [tempPw, setTempPw] = useState('');
  const [settingPw, setSettingPw] = useState(false);

  useEffect(() => { setPicking(false); setSettingPw(false); setTempPw(''); }, [user?.id]);
  if (!user) return null;

  const isSelf = String(user.id) === String(me?.id || me?._id);
  const locked = isAdminLevel(user) && !iAmSuper; // only a super admin edits admin accounts
  const canAct = !isSelf && !locked;
  const assignable = ROLE_ORDER.filter((r) => iAmSuper || !ADMIN_LEVEL_ROLES.includes(r));

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      const res = await fn();
      if (okMsg) Alert.alert('Done', okMsg(res));
      return res;
    } catch (e) {
      Alert.alert('Could not complete that', errText(e, 'Please try again.'));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (status) => {
    const verb = { active: 'Reactivate', suspended: 'Suspend', inactive: 'Deactivate' }[status];
    Alert.alert(
      `${verb} ${fullName(user)}?`,
      status === 'active'
        ? 'They will be able to sign in again.'
        : 'They are signed out immediately and cannot sign in until reactivated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: verb,
          style: status === 'active' ? 'default' : 'destructive',
          onPress: async () => {
            const res = await run(() => adminService.updateUser(user.id, { status }));
            if (res) onChanged({ id: user.id, status, isActive: status === 'active' });
          },
        },
      ]
    );
  };

  const setRole = (role) => {
    if (role === user.role) { setPicking(false); return; }
    const lower = ROLE_ORDER.indexOf(role) > ROLE_ORDER.indexOf(user.role);
    Alert.alert(
      `Change role to ${roleLabel(role)}?`,
      `${fullName(user)} ${lower ? 'loses' : 'gains'} the access that goes with the ${lower ? roleLabel(user.role) : roleLabel(role)} role.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change role',
          onPress: async () => {
            const res = await run(() => adminService.updateUser(user.id, { role, roles: [role] }));
            if (res) { onChanged({ id: user.id, role, roles: [role] }); setPicking(false); }
          },
        },
      ]
    );
  };

  const savePassword = async () => {
    if (tempPw.length < 8) return Alert.alert('Too short', 'Use at least 8 characters.');
    const res = await run(
      () => adminService.updateUser(user.id, { password: tempPw }),
      () => `${fullName(user)} must choose their own password the next time they sign in, and their sessions have ended.`
    );
    if (res) { setSettingPw(false); setTempPw(''); onChanged({ id: user.id, requirePasswordChange: true }); }
  };

  const Action = ({ icon, label, onPress, danger, disabled }) => (
    <TouchableOpacity
      style={[styles.action, disabled && { opacity: 0.4 }]}
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.info} />
      <Text style={[styles.actionText, danger && { color: colors.danger }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <View style={styles.avatarLg}>
              <Text style={styles.avatarLgText}>{(user.firstName || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetName} numberOfLines={1}>{fullName(user)}</Text>
              <Text style={styles.sub} numberOfLines={1}>{roleLabel(user.role)} · {user.status}</Text>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close"><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 520 }} keyboardShouldPersistTaps="handled">
            <Info k="Email" v={user.email} />
            <Info k="Phone" v={user.phone} />
            {!!user.accountNumber && <Info k="Account" v={user.accountNumber} />}
            <Info k="Last sign-in" v={user.lastLogin ? `${new Date(user.lastLogin).toLocaleString()}${user.lastLoginIp ? ` · ${user.lastLoginIp}` : ''}` : 'Never'} />
            <Info k="2-step sign-in" v={user.mfaEnabled ? 'On' : 'Off'} />
            {user.activationPending && <Info k="Activation" v="Email not confirmed yet" />}

            {isSelf && <Text style={styles.note}>This is your own account. Change your own details from Profile.</Text>}
            {locked && <Text style={styles.note}>Only a super admin can change admin accounts.</Text>}

            {canAct && !picking && !settingPw && (
              <View style={styles.actions}>
                <Action icon="swap-vertical" label="Change role / reduce privileges" onPress={() => setPicking(true)} />
                {user.status === 'active' ? (
                  <>
                    <Action icon="pause-circle" label="Suspend" danger onPress={() => setStatus('suspended')} />
                    <Action icon="ban" label="Deactivate" danger onPress={() => setStatus('inactive')} />
                  </>
                ) : (
                  <Action icon="play-circle" label="Reactivate" onPress={() => setStatus('active')} />
                )}
                <Action icon="key" label="Set temporary password" onPress={() => setSettingPw(true)} />
                {user.activationPending && (
                  <Action
                    icon="mail"
                    label="Resend activation email"
                    onPress={() => run(() => adminService.resendActivation(user.id), () => 'Activation email sent.')}
                  />
                )}
                {user.mfaEnabled && (
                  <Action
                    icon="shield-half"
                    label="Reset 2-step sign-in"
                    onPress={() =>
                      Alert.alert('Reset 2-step sign-in?', `${fullName(user)} will be asked to set it up again.`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Reset', style: 'destructive', onPress: () => run(() => adminService.resetMfa(user.id), () => '2-step sign-in reset.').then((r) => r && onChanged({ id: user.id, mfaEnabled: false })) },
                      ])
                    }
                  />
                )}
              </View>
            )}

            {canAct && picking && (
              <View>
                <Text style={styles.pickTitle}>New role</Text>
                {assignable.map((r) => (
                  <TouchableOpacity key={r} style={styles.roleOption} onPress={() => setRole(r)} disabled={busy}>
                    <Text style={[styles.roleOptionText, r === user.role && { color: colors.info, fontWeight: '700' }]}>{roleLabel(r)}</Text>
                    {r === user.role && <Ionicons name="checkmark" size={18} color={colors.info} />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setPicking(false)} style={styles.link}><Text style={styles.linkText}>Back</Text></TouchableOpacity>
              </View>
            )}

            {canAct && settingPw && (
              <View>
                <Text style={styles.pickTitle}>Temporary password</Text>
                <TextInput
                  style={styles.input}
                  value={tempPw}
                  onChangeText={setTempPw}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Temporary password"
                />
                <Text style={styles.note}>They must change it at their next sign-in, and all their sessions end now.</Text>
                <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                  <TouchableOpacity onPress={() => setSettingPw(false)} style={[styles.btn, styles.btnGhost, styles.grow]}><Text style={styles.btnGhostText}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={savePassword} style={[styles.btn, styles.grow]} disabled={busy}><Text style={styles.btnText}>Save</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
          {busy && <ActivityIndicator style={styles.busy} color={colors.info} />}
        </View>
      </View>
    </Modal>
  );
};

const Info = ({ k, v }) => (
  <View style={styles.info}>
    <Text style={styles.infoK}>{k}</Text>
    <Text style={styles.infoV} selectable>{v || '—'}</Text>
  </View>
);

/* ── Create user ─────────────────────────────────────────────────────── */

const CreateUserModal = ({ visible, iAmSuper, onClose, onCreated }) => {
  const empty = { firstName: '', lastName: '', email: '', phone: '', role: 'tenant' };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const roles = ROLE_ORDER.filter((r) => iAmSuper || !ADMIN_LEVEL_ROLES.includes(r));

  useEffect(() => { if (visible) { setF(empty); setResult(null); } }, [visible]);

  const submit = async () => {
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.phone.trim()) {
      return Alert.alert('Missing details', 'Enter first name, last name, email and phone.');
    }
    setBusy(true);
    try {
      const { data } = await adminService.createUser({
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email.trim().toLowerCase(),
        phone: normalizeKenyanPhone(f.phone) || f.phone.trim(),
        role: f.role,
      });
      setResult(data);
      onCreated();
    } catch (e) {
      Alert.alert('Could not create user', errText(e, 'Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const field = (key, label, extra = {}) => (
    <View style={{ marginBottom: spacing[3] }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={f[key]}
        onChangeText={(t) => setF((p) => ({ ...p, [key]: t }))}
        autoCorrect={false}
        {...extra}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={[styles.sheetName, { flex: 1 }]}>{result ? 'User created' : 'New user'}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close"><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
          </View>

          {result ? (
            <View>
              <Text style={styles.infoV}>{fullName(result.user)} · {roleLabel(result.user?.role)}</Text>
              <Text style={styles.note}>
                {result.activationEmailSent
                  ? 'An activation email is on its way.'
                  : 'The activation email could not be sent. Resend it from the user\'s card.'}
              </Text>
              {!!result.initialPassword && (
                <View style={styles.pwBox}>
                  <Text style={styles.label}>Temporary password (shown once)</Text>
                  <Text style={styles.pw} selectable>{result.initialPassword}</Text>
                  <TouchableOpacity
                    onPress={async () => { await Clipboard.setStringAsync(result.initialPassword); Alert.alert('Copied', 'Share it with them securely.'); }}
                    style={[styles.btn, { marginTop: spacing[2] }]}
                  >
                    <Text style={styles.btnText}>Copy password</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost, { marginTop: spacing[3] }]}><Text style={styles.btnGhostText}>Done</Text></TouchableOpacity>
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 520 }}>
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                <View style={{ flex: 1 }}>{field('firstName', 'First name', { autoCapitalize: 'words' })}</View>
                <View style={{ flex: 1 }}>{field('lastName', 'Last name', { autoCapitalize: 'words' })}</View>
              </View>
              {field('email', 'Email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
              {field('phone', 'Phone', { keyboardType: 'phone-pad' })}
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleWrap}>
                {roles.map((r) => (
                  <Chip key={r} small label={roleLabel(r)} active={f.role === r} onPress={() => setF((p) => ({ ...p, role: r }))} />
                ))}
              </View>
              <TouchableOpacity onPress={submit} style={[styles.btn, { marginTop: spacing[4] }]} disabled={busy}>
                {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Create user</Text>}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  newLink: { color: colors.leaf, fontWeight: '700', fontSize: typography.sm, marginLeft: spacing[3] },
  roleText: { color: colors.textSecondary, fontSize: typography.sm },
  tab: { paddingVertical: spacing[3], marginRight: spacing[5], borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: typography.sm, fontWeight: '600' },
  tabTextOn: { color: colors.textPrimary },
  statusLine: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[5], paddingBottom: spacing[2] },
  statusOpt: { marginRight: spacing[4], paddingVertical: 4 },
  statusOptText: { color: colors.textMuted, fontSize: typography.xs },
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[5] },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing[5], marginTop: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.textPrimary, paddingVertical: spacing[3], fontSize: typography.sm },
  chips: { paddingHorizontal: spacing[5], alignItems: 'center' },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 999,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipSmall: { paddingVertical: 4, paddingHorizontal: spacing[3] },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  count: { color: colors.textMuted, fontSize: typography.xs, marginLeft: spacing[2] },
  row: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing[5], paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: typography.base },
  name: { color: colors.textPrimary, fontWeight: '600', fontSize: typography.base },
  sub: { color: colors.textMuted, fontSize: typography.sm, marginTop: 2 },
  roleBadge: { backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: 8 },
  roleBadgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: colors.textMuted, fontSize: typography.xs, textTransform: 'capitalize' },
  empty: { color: colors.textSecondary, textAlign: 'center' },
  retry: { marginTop: spacing[3], padding: spacing[3] },
  retryText: { color: colors.info, fontWeight: '700' },
  fab: {
    position: 'absolute', right: spacing[5], bottom: spacing[5], width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing[4], paddingBottom: spacing[6],
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  sheetName: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '700' },
  avatarLg: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarLgText: { color: colors.white, fontWeight: '700', fontSize: typography.xl },
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  infoK: { color: colors.textSecondary, fontSize: typography.sm },
  infoV: { color: colors.textPrimary, fontSize: typography.sm, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: spacing[3] },
  note: { color: colors.textSecondary, fontSize: typography.xs, marginVertical: spacing[3] },
  actions: { marginTop: spacing[2] },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] },
  actionText: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600' },
  pickTitle: { color: colors.textPrimary, fontWeight: '700', marginVertical: spacing[3] },
  roleOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  roleOptionText: { color: colors.textPrimary, fontSize: typography.base },
  link: { paddingVertical: spacing[3], alignSelf: 'flex-start' },
  linkText: { color: colors.info, fontWeight: '700' },
  label: { color: colors.textSecondary, fontSize: typography.xs, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3], paddingVertical: spacing[3], color: colors.textPrimary, fontSize: typography.base,
  },
  roleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  btn: { minHeight: 48, backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingVertical: spacing[3], paddingHorizontal: spacing[4], alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: typography.base },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textPrimary, fontWeight: '700' },
  pwBox: { backgroundColor: colors.bg, borderRadius: borderRadius.lg, padding: spacing[3], marginTop: spacing[3] },
  pw: { color: colors.textPrimary, fontSize: typography.lg, fontWeight: '700', letterSpacing: 1 },
  busy: { position: 'absolute', top: spacing[4], right: spacing[12] },
});

export default AdminUsersScreen;
