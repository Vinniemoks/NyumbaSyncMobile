#!/usr/bin/env bash
# Build a signed release APK and (optionally) publish it for the in-app updater.
#
#   scripts/release-android.sh <versionCode> <versionName> "release notes"          # build only
#   scripts/release-android.sh <versionCode> <versionName> "release notes" --publish # + GitHub release
#
# versionCode must be higher than the last release (the app compares it with
# its installed build). Signing key: ~/.nyumbasync/release.jks — back it up;
# lose it and installed apps can never update.
set -euo pipefail
cd "$(dirname "$0")/.."

CODE="${1:?versionCode}"; NAME="${2:?versionName}"; NOTES="${3:-}"; PUBLISH="${4:-}"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
export NODE_ENV=production
[ -f "$HOME/.nyumbasync/key.properties" ] || { echo "missing ~/.nyumbasync/key.properties" >&2; exit 1; }

# /android is generated and gitignored; regenerate it if absent.
[ -d android ] || npx expo prebuild --platform android --no-install

(cd android && ./gradlew assembleRelease --no-daemon \
  -PappVersionCode="$CODE" -PappVersionName="$NAME" \
  -PreactNativeArchitectures=arm64-v8a,armeabi-v7a)

OUT=release-out; mkdir -p "$OUT"
APK="$OUT/NyumbaSync-$NAME.apk"
cp android/app/build/outputs/apk/release/app-release.apk "$APK"
SIZE=$(stat -f%z "$APK")
SHA=$(shasum -a 256 "$APK" | cut -d' ' -f1)
URL="https://github.com/Vinniemoks/NyumbaSyncMobile/releases/download/v$NAME/NyumbaSync-$NAME.apk"
node -e 'const [c,n,u,s,h,notes]=process.argv.slice(1);require("fs").writeFileSync("release-out/latest.json",JSON.stringify({versionCode:+c,versionName:n,apkUrl:u,size:+s,sha256:h,notes},null,2)+"\n")' \
  "$CODE" "$NAME" "$URL" "$SIZE" "$SHA" "$NOTES"
echo "built $APK ($SIZE bytes, sha256 $SHA)"

if [ "$PUBLISH" = "--publish" ]; then
  gh release create "v$NAME" "$APK" "$OUT/latest.json" -R Vinniemoks/NyumbaSyncMobile \
    --title "NyumbaSync $NAME" --notes "${NOTES:-NyumbaSync $NAME}"
  echo "published v$NAME"
fi
