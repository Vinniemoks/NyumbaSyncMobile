import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, commonStyles } from '../../config/theme';

export default function CookiePolicyScreen({ navigation }) {
  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cookie Policy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: 24 June 2025</Text>
        <Text style={styles.bodyText}>This is the Cookie Policy for NyumbaSync. For the full text, please visit nyumbasync.co.ke/legal or contact legal@nyumbasync.co.ke.</Text>
        <Text style={styles.bodyText}>NyumbaSync Ltd is a property management platform registered in Kenya, committed to transparency, security, and compliance.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[5], backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.surfaceHover },
  headerTitle: { fontSize: typography.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  content: { padding: spacing[5] },
  lastUpdated: { fontSize: typography.sm, color: colors.textMuted, marginBottom: spacing[4] },
  bodyText: { fontSize: typography.base, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing[4] },
});
