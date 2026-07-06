import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../config/theme';

/**
 * Polymorphic Button component for NyumbaSync Mobile.
 *
 * Variants:
 *   - primary:   solid green background, gold text
 *   - secondary: dark surface background, leaf text
 *   - outline:   transparent with leaf border/text
 *   - ghost:     transparent with muted text
 *
 * Usage:
 *   <Button title="Sign In" onPress={handleLogin} loading={loading} />
 *   <Button variant="outline" onPress={handleCancel}>Cancel</Button>
 *   <Button icon="arrow-forward" iconPosition="right">Next</Button>
 */
const Button = ({
  title,
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const content = children || (title ? <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text> : null);

  const renderIcon = () => {
    if (!icon || typeof icon !== 'string') return null;
    const iconColor = variant === 'primary'
      ? colors.gold
      : variant === 'secondary'
      ? colors.leaf
      : variant === 'outline'
      ? colors.leaf
      : colors.textSecondary;
    return (
      <Ionicons
        name={icon}
        size={18}
        color={iconColor}
        style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.gold : colors.leaf} />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          {content}
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  md: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  text: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },

  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: `${colors.gold}60`,
  },
  primaryText: {
    color: colors.gold,
  },

  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: `${colors.gold}40`,
  },
  secondaryText: {
    color: colors.leaf,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.leaf,
  },
  outlineText: {
    color: colors.leaf,
  },

  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  ghostText: {
    color: colors.textSecondary,
  },
});

export default Button;
