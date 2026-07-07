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
 *   - primary:   forest green background, white text, gold border accent
 *   - secondary: dark surface background, leaf text
 *   - outline:   transparent with leaf border/text
 *   - ghost:     transparent with muted text
 *   - danger:    red background, white text
 *   - soft:      tinted green surface, leaf text
 *
 * Usage:
 *   <Button title="Sign In" onPress={handleLogin} loading={loading} fullWidth />
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
  fullWidth = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const iconColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.white;
      case 'secondary':
      case 'outline':
      case 'soft':
        return colors.leaf;
      default:
        return colors.textSecondary;
    }
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={iconColor()}
          style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
        />
      );
    }
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <Ionicons
          name={icon}
          size={18}
          color={iconColor()}
          style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
        />
      );
    }
    return (
      <Text style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}>
        {icon}
      </Text>
    );
  };

  const content = children || (
    <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
      {title}
    </Text>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[size],
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {iconPosition === 'left' && renderIcon()}
      {content}
      {iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius['2xl'],
  },
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 36,
  },
  md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    minHeight: 48,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
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
    borderColor: `${colors.gold}55`,
    ...shadows.card,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryText: {
    color: colors.white,
  },

  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: `${colors.gold}40`,
    ...shadows.card,
  },
  secondaryText: {
    color: colors.leaf,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
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

  danger: {
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: `${colors.danger}60`,
    ...shadows.card,
  },
  dangerText: {
    color: colors.white,
  },

  soft: {
    backgroundColor: `${colors.leaf}15`,
    borderWidth: 1,
    borderColor: `${colors.leaf}25`,
  },
  softText: {
    color: colors.leaf,
  },
});

export default Button;
