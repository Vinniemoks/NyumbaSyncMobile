import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../config/theme';

/**
 * NyumbaSync Logo Component
 * Renders the brand logo as a custom React Native component.
 * Dark navy rounded square background with gold house icon.
 * 
 * Usage:
 *   <Logo size={88} />
 *   <Logo size={48} style={{ marginBottom: 16 }} />
 */

const Logo = ({ size = 64, style }) => {
  const scale = size / 64;
  
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 6 }, style]}>
      {/* Background */}
      <View style={[styles.bg, { width: size, height: size, borderRadius: size / 6 }]} />
      
      {/* Gold border */}
      <View style={[styles.border, { width: size - 2, height: size - 2, borderRadius: size / 6 }]} />
      
      {/* House icon */}
      <View style={styles.houseContainer}>
        {/* Roof */}
        <View style={[styles.roof, { 
          borderLeftWidth: 18 * scale, 
          borderRightWidth: 18 * scale, 
          borderBottomWidth: 14 * scale,
        }]} />
        
        {/* Body */}
        <View style={[styles.body, { width: 24 * scale, height: 18 * scale }]} />
        
        {/* Door */}
        <View style={[styles.door, { width: 8 * scale, height: 10 * scale }]} />
        
        {/* Door knob */}
        <View style={[styles.knob, { width: 2 * scale, height: 2 * scale, borderRadius: scale }]} />
        
        {/* Left Window */}
        <View style={[styles.window, { width: 6 * scale, height: 6 * scale, left: -10 * scale, top: -4 * scale }]} />
        <View style={[styles.windowCrossV, { height: 6 * scale, left: -7 * scale, top: -4 * scale }]} />
        <View style={[styles.windowCrossH, { width: 6 * scale, left: -10 * scale, top: -1 * scale }]} />
        
        {/* Right Window */}
        <View style={[styles.window, { width: 6 * scale, height: 6 * scale, left: 4 * scale, top: -4 * scale }]} />
        <View style={[styles.windowCrossV, { height: 6 * scale, left: 7 * scale, top: -4 * scale }]} />
        <View style={[styles.windowCrossH, { width: 6 * scale, left: 4 * scale, top: -1 * scale }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    backgroundColor: colors.darkBlue,
  },
  border: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: `${colors.gold}60`,
  },
  houseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  roof: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.gold,
    marginBottom: -2,
  },
  body: {
    backgroundColor: colors.gold,
  },
  door: {
    position: 'absolute',
    backgroundColor: colors.darkBlue,
    bottom: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  knob: {
    position: 'absolute',
    backgroundColor: colors.gold,
    bottom: 4,
    right: -2,
  },
  window: {
    position: 'absolute',
    backgroundColor: colors.darkBlue,
    borderRadius: 1,
  },
  windowCrossV: {
    position: 'absolute',
    width: 1,
    backgroundColor: colors.gold,
  },
  windowCrossH: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.gold,
  },
});

export default Logo;
