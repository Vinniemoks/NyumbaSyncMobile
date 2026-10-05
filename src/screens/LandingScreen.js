import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, commonStyles } from '../config/theme';
import Logo from '../components/Logo';
import Button from '../components/Button';

// The app opens straight to the actions; the pitch lives on the website.
const LandingScreen = ({ navigation }) => (
  <View style={[commonStyles.container, styles.page]}>
    <View style={styles.top}>
      <Logo size={44} style={{ alignSelf: "flex-start" }} />
      <Text style={styles.name}>NyumbaSync</Text>
    </View>

    <View style={styles.actions}>
      <Button title="Sign in" size="lg" onPress={() => navigation.navigate('Login')} />
      <Button variant="secondary" title="Create an account" size="lg" onPress={() => navigation.navigate('Signup')} style={styles.gap} />
      <TouchableOpacity onPress={() => navigation.navigate('PublicListings')} style={styles.browse} accessibilityRole="button">
        <Text style={styles.browseText}>Browse listings</Text>
      </TouchableOpacity>

      <View style={styles.footerLinks}>
        <TouchableOpacity onPress={() => navigation.navigate('TermsOfServiceScreen')}>
          <Text style={styles.footerLink}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
          <Text style={styles.footerLink}>Privacy</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  page: { paddingHorizontal: spacing[6] },
  top: { flex: 1, justifyContent: 'center' },
  name: { marginTop: spacing[4], fontSize: 40, fontWeight: '700', letterSpacing: -1, color: colors.textPrimary },
  actions: { paddingBottom: spacing[8] },
  gap: { marginTop: spacing[3] },
  browse: { alignSelf: 'flex-start', paddingVertical: spacing[4] },
  browseText: { fontSize: typography.sm, color: colors.textPrimary, fontWeight: '600', textDecorationLine: 'underline' },
  footerLinks: { flexDirection: 'row', gap: spacing[5] },
  footerLink: { fontSize: typography.xs, color: colors.textMuted },
});

export default LandingScreen;
