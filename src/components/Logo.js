import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors, typography, spacing } from '../config/theme';

/**
 * NyumbaSync Logo Component
 * Renders the brand logo as an SVG mark matching the web app logo.
 *
 * Usage:
 *   <Logo size={88} />
 *   <Logo size={64} showWordmark style={{ marginBottom: 24 }} />
 */

const logoSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#14532d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="goldGrad512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8C84A;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#D4AF37;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B6914;stop-opacity:1" />
    </linearGradient>
    <filter id="glow512" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12.8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect x="0" y="0" width="512" height="512" rx="85.3333" ry="85.3333" fill="url(#bgGrad512)" />
  <rect x="4" y="4" width="504" height="504" rx="85.3333" ry="85.3333"
        fill="none" stroke="url(#goldGrad512)" stroke-width="4" opacity="0.6" />
  <polygon points="89.6,328.5333 256,221.0133 422.4,328.5333" fill="url(#goldGrad512)" />
  <rect x="128" y="328.5333" width="256" height="179.2" fill="url(#goldGrad512)" />
  <rect x="213.3333" y="418.1333" width="85.3333" height="89.6" fill="#0f172a" rx="10.6667" />
  <circle cx="266.6667" cy="462.9333" r="10.6667" fill="url(#goldGrad512)" />
  <rect x="160" y="358.4" width="51.2" height="51.2" fill="#0f172a" rx="6.4" />
  <line x1="185.6" y1="358.4" x2="185.6" y2="409.6" stroke="url(#goldGrad512)" stroke-width="2" />
  <line x1="160" y1="384" x2="211.2" y2="384" stroke="url(#goldGrad512)" stroke-width="2" />
  <rect x="300.8" y="358.4" width="51.2" height="51.2" fill="#0f172a" rx="6.4" />
  <line x1="326.4" y1="358.4" x2="326.4" y2="409.6" stroke="url(#goldGrad512)" stroke-width="2" />
  <line x1="300.8" y1="384" x2="352" y2="384" stroke="url(#goldGrad512)" stroke-width="2" />
  <ellipse cx="256" cy="85.3333" rx="170.6667" ry="51.2" fill="url(#goldGrad512)" opacity="0.08" filter="url(#glow512)" />
</svg>
`;

const Logo = ({ size = 64, showWordmark = false, style }) => {
  return (
    <View style={[styles.container, style]}>
      <SvgXml xml={logoSvg(size)} width={size} height={size} />
      {showWordmark && (
        <Text style={[styles.wordmark, { fontSize: Math.max(16, size * 0.35) }]}>
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
