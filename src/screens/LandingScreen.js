import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, commonStyles } from '../config/theme';
import Logo from '../components/Logo';
import { fonts } from '../config/fonts';
import Button from '../components/Button';

// The app opens straight to the actions; the pitch lives on the website.
const LandingScreen = ({ navigation }) => (
  <View style={[commonStyles.container, styles.page]}>
    <View style={styles.top}>
      <View style={styles.brand}>
        <Logo size={40} />
        <Text style={styles.name}>NyumbaSync</Text>
      </View>
      <Text style={styles.headline}>
        Property management{'\n'}
        <Text style={styles.accent}>that actually works.</Text>
      </Text>
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[8] },
  name: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, color: colors.textPrimary },
  headline: { fontSize: 44, lineHeight: 50, fontWeight: '700', letterSpacing: -1.2, color: colors.textPrimary },
  accent: { fontFamily: fonts.serifItalic, fontWeight: '400', color: colors.leaf, letterSpacing: 0, fontSize: 50 },
  actions: { paddingBottom: spacing[8] },
  gap: { marginTop: spacing[3] },
  browse: { alignSelf: 'flex-start', paddingVertical: spacing[4] },
  browseText: { fontSize: typography.sm, color: colors.textPrimary, fontWeight: '600', textDecorationLine: 'underline' },
  footerLinks: { flexDirection: 'row', gap: spacing[5] },
  footerLink: { fontSize: typography.xs, color: colors.textMuted },
});

export default LandingScreen;
