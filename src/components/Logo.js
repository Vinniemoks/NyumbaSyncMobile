import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors, typography, spacing } from '../config/theme';

/**
 * NyumbaSync Logo Component
 * Renders the brand logo as an SVG mark matching the web app logo.
 *
 * Usage:
 *   <Logo size={96} />
 *   <Logo size={72} showWordmark style={{ marginBottom: 24 }} />
 */

const logoSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#14532d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#064e3b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#facc15;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#eab308;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ca8a04;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="96" ry="96" fill="url(#bgGrad)" />
  <path d="M256 64 L448 232 L448 464 L64 464 L64 232 Z" fill="url(#goldGrad)" />
  <path d="M64 232 L256 64 L448 232 L448 248 L256 88 L64 248 Z" fill="#a16207" opacity="0.25" />
  <rect x="196" y="296" width="120" height="168" rx="16" fill="#0f3d2e" />
  <circle cx="292" cy="380" r="10" fill="url(#goldGrad)" />
  <rect x="104" y="264" width="88" height="88" rx="12" fill="#0f3d2e" />
  <line x1="148" y1="264" x2="148" y2="352" stroke="url(#goldGrad)" stroke-width="4" />
  <line x1="104" y1="308" x2="192" y2="308" stroke="url(#goldGrad)" stroke-width="4" />
  <rect x="320" y="264" width="88" height="88" rx="12" fill="#0f3d2e" />
  <line x1="364" y1="264" x2="364" y2="352" stroke="url(#goldGrad)" stroke-width="4" />
  <line x1="320" y1="308" x2="408" y2="308" stroke="url(#goldGrad)" stroke-width="4" />
  <rect x="352" y="128" width="44" height="100" rx="8" fill="url(#goldGrad)" />
</svg>
`;

const Logo = ({ size = 72, showWordmark = false, style }) => {
  return (
    <View style={[styles.container, style]}>
      <SvgXml xml={logoSvg(size)} width={size} height={size} />
      {showWordmark && (
        <Text style={[styles.wordmark, { fontSize: Math.max(18, size * 0.38) }]}>
          NyumbaSync
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: spacing[2],
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});

export default Logo;
