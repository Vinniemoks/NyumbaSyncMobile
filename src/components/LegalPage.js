import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../config/theme';

// The full legal texts live on the website; the app points there instead of
// carrying a second copy that could drift out of date.
const SITE = 'https://nyumbasync.co.ke/legal';
const MAIL = 'legal@nyumbasync.co.ke';

const LegalPage = ({ title, navigation }) => (
  <SafeAreaView style={styles.page}>
    <ScrollView contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>
        NyumbaSync Ltd is a property management platform registered in Kenya. The full text is published on our website.
      </Text>
      <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(SITE)}>
        <Text style={styles.rowText}>Read it on nyumbasync.co.ke</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`mailto:${MAIL}`)}>
        <Text style={styles.rowText}>{MAIL}</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[5] },
  back: { color: colors.leaf, fontSize: typography.base, fontWeight: '600', marginBottom: spacing[5] },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: '700', letterSpacing: -0.6, marginBottom: spacing[3] },
  body: { color: colors.textSecondary, fontSize: typography.base, lineHeight: 24, marginBottom: spacing[5] },
  row: { paddingVertical: spacing[4], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowText: { color: colors.leaf, fontSize: typography.base, fontWeight: '600' },
});

export default LegalPage;
