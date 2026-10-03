import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import { checkForUpdate, downloadAndInstall, openApkInBrowser, updatesSupported, installedVersion, installedBuild } from '../services/appUpdate';

// Offers an update at launch and when the app returns to the foreground
// (at most once an hour). Renders nothing.
const MIN_GAP_MS = 60 * 60 * 1000;

export async function checkAndOffer({ manual = false } = {}) {
  if (!updatesSupported()) {
    if (manual) Alert.alert('Updates', 'In-app updates are only available on Android.');
    return;
  }
  let manifest;
  try {
    manifest = await checkForUpdate();
  } catch (e) {
    if (manual) Alert.alert('Could not check for updates', 'Check your connection and try again.');
    return;
  }
  if (!manifest) {
    if (manual) Alert.alert('You’re up to date', `Version ${installedVersion()} (build ${installedBuild()})`);
    return;
  }
  const notes = manifest.notes ? `\n\n${manifest.notes}` : '';
  Alert.alert(
    'Update available',
    `Version ${manifest.versionName || manifest.versionCode} is ready.${notes}`,
    [
      { text: 'Later', style: 'cancel' },
      {
        text: 'Update now',
        onPress: async () => {
          try {
            await downloadAndInstall(manifest);
          } catch (e) {
            Alert.alert('Update failed', `${e.message}\n\nOpen the download in your browser instead?`, [
              { text: 'No', style: 'cancel' },
              { text: 'Open', onPress: () => openApkInBrowser(manifest) },
            ]);
          }
        },
      },
    ]
  );
}

export default function UpdatePrompt() {
  const last = useRef(0);
  const run = useCallback(() => {
    if (Date.now() - last.current < MIN_GAP_MS) return;
    last.current = Date.now();
    checkAndOffer();
  }, []);

  useEffect(() => {
    if (__DEV__) return undefined; // Metro dev builds are not the installable APK
    run();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && run());
    return () => sub.remove();
  }, [run]);

  return null;
}
