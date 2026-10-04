import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { dashboardFor } from '../utils/roleRoutes';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../config/theme';

const SplashScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return undefined;
    const t = setTimeout(() => navigation.replace(dashboardFor(user) || 'Landing'), 500);
    return () => clearTimeout(t);
  }, [loading, user, navigation]);

  return (
    <View style={commonStyles.container}>
      <Logo size={96} showWordmark style={{ marginBottom: spacing[6] }} />
      <ActivityIndicator size="large" color={colors.gold} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: `${colors.gold}20`,
    borderWidth: 1,
    borderColor: `${colors.gold}40`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textMuted,
    marginBottom: spacing[10],
  },
  loader: {
    marginTop: spacing[5],
  },
});

export default SplashScreen;
