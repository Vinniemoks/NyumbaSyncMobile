// Secure credential storage for the mobile app.
//
// Auth tokens must NOT live in AsyncStorage: that store is unencrypted and
// readable from a rooted/jailbroken or backed-up device. Tokens go into the
// OS keystore/keychain via expo-secure-store instead. Non-sensitive data
// (cached user profile) stays in AsyncStorage.
//
// expo-secure-store is loaded lazily with an AsyncStorage fallback so the app
// keeps working if the native module has not been installed/rebuilt yet
// (run `npx expo install expo-secure-store` and rebuild the dev client).
// See the security audit (2026-07-12).

import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore = null;
try {
  // eslint-disable-next-line global-require
  SecureStore = require('expo-secure-store');
} catch (_) {
  SecureStore = null;
}

const hasSecureStore = !!(SecureStore && SecureStore.setItemAsync);

// Keys that hold secrets and must use the keystore when available.
const SECURE_KEYS = new Set([
  'nyumbasync_auth_token',
  'nyumbasync_refresh_token',
]);

export async function setSecure(key, value) {
  if (value == null) return;
  if (hasSecureStore && SECURE_KEYS.has(key)) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

export async function getSecure(key) {
  if (hasSecureStore && SECURE_KEYS.has(key)) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

export async function removeSecure(key) {
  // Remove from both stores so migrating between fallbacks never leaves a stale copy.
  try {
    if (hasSecureStore && SECURE_KEYS.has(key)) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (_) { /* ignore */ }
  try {
    await AsyncStorage.removeItem(key);
  } catch (_) { /* ignore */ }
}

// Non-sensitive values (e.g. cached user profile JSON) — plain AsyncStorage.
export async function setPlain(key, value) {
  await AsyncStorage.setItem(key, value);
}
export async function getPlain(key) {
  return AsyncStorage.getItem(key);
}
export async function removePlain(key) {
  await AsyncStorage.removeItem(key);
}
