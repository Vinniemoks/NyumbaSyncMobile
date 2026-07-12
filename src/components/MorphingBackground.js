import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../config/theme';

const { width, height } = Dimensions.get('window');

/**
 * MorphingBackground — polymorphic animated backdrop for the dark slate theme.
 *
 * Renders soft organic blobs that continuously drift, rotate, and breathe
 * behind screen content. Mirrors the web app's `.poly-blob` background.
 * Purely decorative (pointerEvents="none"); uses only the core Animated API
 * with the native driver, so it adds no JS-thread work per frame.
 *
 * Usage: place as the first child of a screen container:
 *   <View style={commonStyles.container}>
 *     <MorphingBackground />
 *     ...content
 *   </View>
 */

// Irregular corner radii make each blob organic; animating rotation + scale
// over them reads as a continuous shape morph.
const BLOBS = [
  {
    size: width * 0.9,
    top: -height * 0.12,
    left: -width * 0.3,
    color: `${colors.leaf}26`, // ~15% alpha
    radii: [0.62, 0.38, 0.55, 0.45],
    duration: 16000,
    drift: { x: width * 0.08, y: height * 0.04 },
  },
  {
    size: width * 0.75,
    top: height * 0.35,
    left: width * 0.55,
    color: `${colors.gold}1f`, // ~12% alpha
    radii: [0.4, 0.6, 0.35, 0.65],
    duration: 22000,
    drift: { x: -width * 0.1, y: height * 0.05 },
  },
  {
    size: width * 0.85,
    top: height * 0.72,
    left: -width * 0.2,
    color: `${colors.leafDeep}40`, // ~25% alpha
    radii: [0.55, 0.45, 0.65, 0.35],
    duration: 19000,
    drift: { x: width * 0.06, y: -height * 0.05 },
  },
];

const Blob = ({ size, top, left, color, radii, duration, drift }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, drift.x] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, drift.y] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '35deg'] });
  const scale = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.15, 0.95] });
  const opacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 1, 0.85] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        backgroundColor: color,
        borderTopLeftRadius: size * radii[0],
        borderTopRightRadius: size * radii[1],
        borderBottomRightRadius: size * radii[2],
        borderBottomLeftRadius: size * radii[3],
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }, { scale }],
      }}
    />
  );
};

const MorphingBackground = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    {BLOBS.map((blob, i) => (
      <Blob key={i} {...blob} />
    ))}
  </View>
);

export default MorphingBackground;
