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
  <rect width="512" height="512" rx="104" fill="#16294D" />
  <path d="M256 104 L408 232 V408 H104 V232 Z" fill="none" stroke="#F6F4EF" stroke-width="28" stroke-linejoin="round" />
  <path d="M208 408 V300 H304 V408" fill="none" stroke="#F6F4EF" stroke-width="28" stroke-linejoin="round" />
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
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: spacing[2],
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -0.2,
  },
});

export default Logo;
