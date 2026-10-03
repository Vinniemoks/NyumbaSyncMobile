// Records fatal JS errors so the next launch can show what went wrong.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'nyumbasync_last_crash';

export const recordCrash = async (error, isFatal) => {
  try {
    const text = `${isFatal ? 'FATAL' : 'error'} ${new Date().toISOString()}\n${error?.message || String(error)}\n${(error?.stack || '').split('\n').slice(0, 8).join('\n')}`;
    await AsyncStorage.setItem(KEY, text);
  } catch (_) { /* nothing more we can do */ }
};

export const takeLastCrash = async () => {
  try {
    const t = await AsyncStorage.getItem(KEY);
    if (t) await AsyncStorage.removeItem(KEY);
    return t;
  } catch (_) {
    return null;
  }
};

export const installCrashHandler = () => {
  const eu = global.ErrorUtils;
  if (!eu || global.__nyumbaCrashHandler) return;
  global.__nyumbaCrashHandler = true;
  const previous = eu.getGlobalHandler && eu.getGlobalHandler();
  eu.setGlobalHandler((error, isFatal) => {
    recordCrash(error, isFatal);
    if (previous) previous(error, isFatal);
  });
};
