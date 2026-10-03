import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, commonStyles } from '../config/theme';
import Logo from '../components/Logo';
import Button from '../components/Button';
import MorphingBackground from '../components/MorphingBackground';

// The app opens straight to the actions; the pitch lives on the website.
const LandingScreen = ({ navigation }) => (
  <View style={commonStyles.container}>
    <MorphingBackground />

    <View style={styles.center}>
      <Logo size={104} />
      <Text style={styles.name}>NyumbaSync</Text>
    </View>

    <View style={styles.actions}>
      <Button
        title="Get Started"
        icon="arrow-forward"
        iconPosition="right"
        size="lg"
        onPress={() => navigation.navigate('Signup')}
      />
      <Button variant="secondary" title="Sign in" size="lg" onPress={() => navigation.navigate('Login')} style={styles.gap} />
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: {
    marginTop: spacing[5],
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.gold,
  },
  actions: { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
  gap: { marginTop: spacing[3] },
  browse: { alignSelf: 'center', padding: spacing[4] },
  browseText: {
    fontSize: typography.sm,
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
  },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: spacing[6] },
  footerLink: { fontSize: typography.xs, color: colors.textMuted },
});

export default LandingScreen;
