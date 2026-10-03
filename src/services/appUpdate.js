// In-app updates for the sideloaded Android APK (no Play Store).
//
// scripts/release-android.sh uploads each build to a GitHub release along with
// latest.json: { versionCode, versionName, apkUrl, size, notes }. We compare
// versionCode with the installed build, download the APK, and hand it to the
// system installer. Android refuses to install it unless it is signed with the
// same key as the installed app, so a tampered download cannot get through.
import { Platform, Linking } from 'react-native';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export const MANIFEST_URL =
  'https://github.com/Vinniemoks/NyumbaSyncMobile/releases/latest/download/latest.json';

export const installedBuild = () => Number(Application.nativeBuildVersion) || 0;
export const installedVersion = () => Application.nativeApplicationVersion || '';

export const updatesSupported = () => Platform.OS === 'android';

/** Returns the manifest when a newer build exists, else null. Throws on network errors. */
export async function checkForUpdate() {
  if (!updatesSupported()) return null;
  const res = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) throw new Error(`Update check failed (${res.status})`);
  const m = await res.json();
  if (!m || !Number.isInteger(m.versionCode) || typeof m.apkUrl !== 'string' || !m.apkUrl.startsWith('https://')) {
    throw new Error('Update manifest is malformed');
  }
  return m.versionCode > installedBuild() ? m : null;
}

/** Downloads the APK (onProgress gets 0..1) and opens the system installer. */
export async function downloadAndInstall(manifest, onProgress) {
  const dest = `${FileSystem.cacheDirectory}nyumbasync-${manifest.versionCode}.apk`;
  await FileSystem.deleteAsync(dest, { idempotent: true });
  const task = FileSystem.createDownloadResumable(manifest.apkUrl, dest, {}, (p) => {
    if (onProgress && p.totalBytesExpectedToWrite > 0) {
      onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
    }
  });
  const result = await task.downloadAsync();
  if (!result || result.status !== 200) throw new Error('Download failed');
  const info = await FileSystem.getInfoAsync(dest);
  if (manifest.size && info.size !== manifest.size) {
    await FileSystem.deleteAsync(dest, { idempotent: true });
    throw new Error('Downloaded file is incomplete — try again');
  }
  const uri = await FileSystem.getContentUriAsync(dest);
  await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
    data: uri,
    flags: 1 /* FLAG_GRANT_READ_URI_PERMISSION */,
    extra: { 'android.intent.extra.NOT_UNKNOWN_SOURCE': true },
  });
}

/** Fallback if the installer cannot be launched: let the browser download it. */
export const openApkInBrowser = (manifest) => Linking.openURL(manifest.apkUrl);
