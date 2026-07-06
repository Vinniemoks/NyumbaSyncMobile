import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../config/theme';
import Logo from '../components/Logo';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'home-outline',
    title: 'Manage Properties',
    description: 'List, track, and manage all your properties in one place.',
    gradient: ['#1E293B', '#0F172A'],
    iconColor: colors.leaf,
  },
  {
    icon: 'cash-outline',
    title: 'Collect Rent',
    description: 'M-Pesa, card, or bank transfer — instant receipts.',
    gradient: ['#1E293B', '#0F172A'],
    iconColor: colors.leaf,
  },
  {
    icon: 'construct-outline',
    title: 'Track Maintenance',
    description: 'Report issues, assign vendors, and follow repairs to completion.',
    gradient: ['#1E293B', '#0F172A'],
    iconColor: colors.leaf,
  },
  {
    icon: 'chatbubbles-outline',
    title: 'Stay Connected',
    description: 'Chat with your landlord, tenant, or manager in real time.',
    gradient: ['#1E293B', '#0F172A'],
    iconColor: colors.leaf,
  },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const LandingScreen = ({ navigation }) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={commonStyles.container}>
      {/* Floating Header */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <Text style={styles.floatingHeaderText}>NyumbaSync</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* HERO SECTION */}
        <View style={styles.hero}>
          {/* Decorative gradient orbs */}
          <View style={[styles.orb, styles.orbTop]} />
          <View style={[styles.orb, styles.orbBottom]} />

          {/* Logo */}
          <Logo size={88} />

          {/* Headline */}
          <Text style={styles.heroTitle}>
            Property Management,
          </Text>
          <Text style={styles.heroTitleAccent}>
            Simplified.
          </Text>

          {/* Subheadline */}
          <Text style={styles.heroSubtitle}>
            The all-in-one platform for landlords, tenants, and property managers in Kenya.
          </Text>

          {/* Visual Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statPillNumber}>10K+</Text>
              <Text style={styles.statPillLabel}>Properties</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statPillNumber}>50K+</Text>
              <Text style={styles.statPillLabel}>Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statPillNumber}>KSh 2B+</Text>
              <Text style={styles.statPillLabel}>Processed</Text>
            </View>
          </View>
        </View>

        {/* VISUAL FEATURE CARDS */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>What You Can Do</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={feature.icon} size={28} color={feature.iconColor} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* VISUAL FLOW DIAGRAM */}
        <View style={styles.flowSection}>
          <Text style={styles.sectionLabel}>How It Works</Text>
          <View style={styles.flowTrack}>
            {[
              { icon: 'person-outline', label: 'Sign Up', step: '1' },
              { icon: 'home-outline', label: 'Add Property', step: '2' },
              { icon: 'people-outline', label: 'Connect', step: '3' },
              { icon: 'card-outline', label: 'Transact', step: '4' },
            ].map((item, i) => (
              <View key={i} style={styles.flowNode}>
                <View style={styles.flowStepBadge}>
                  <Text style={styles.flowStepText}>{item.step}</Text>
                </View>
                <View style={styles.flowIconCircle}>
                  <Ionicons name={item.icon} size={20} color={colors.gold} />
                </View>
                <Text style={styles.flowLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TRUST BADGES */}
        <View style={styles.trustSection}>
          <Text style={styles.sectionLabel}>Trusted By</Text>
          <View style={styles.trustRow}>
            {['shield-checkmark-outline', 'lock-closed-outline', 'document-text-outline'].map((icon, i) => (
              <View key={i} style={styles.trustBadge}>
                <Ionicons name={icon} size={20} color={colors.gold} />
              </View>
            ))}
          </View>
          <Text style={styles.trustText}>
            Bank-grade security • PCI-DSS compliant • Kenya Data Protection Act
          </Text>
        </View>

        {/* CTA SECTION */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of landlords and tenants managing properties smarter.
          </Text>

          <Button
            title="Get Started"
            icon="arrow-forward"
            iconPosition="right"
            size="lg"
            onPress={() => navigation.navigate('Signup')}
            style={styles.ctaButton}
          />

          <Button
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
            style={styles.ctaSecondary}
          >
            <Text style={styles.ctaSecondaryText}>I already have an account</Text>
          </Button>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('TermsOfServiceScreen')}>
              <Text style={styles.footerLink}>Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
              <Text style={styles.footerLink}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CookiePolicyScreen')}>
              <Text style={styles.footerLink}>Cookies</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')}>
              <Text style={styles.footerLink}>About</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>© 2025 NyumbaSync Ltd. Made for Kenya 🇰🇪</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Floating Header ──────────────────────────────────────────────
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(10, 22, 40, 0.85)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.10)',
  },
  floatingHeaderText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
    textAlign: 'center',
  },

  // ── Hero ─────────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: spacing[12],
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[5],
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.08,
  },
  orbTop: {
    width: 300,
    height: 300,
    top: -80,
    right: -60,
    backgroundColor: colors.leaf,
  },
  orbBottom: {
    width: 200,
    height: 200,
    bottom: 40,
    left: -50,
    backgroundColor: colors.leaf,
  },
  heroLogo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: `${colors.gold}15`,
    borderWidth: 1,
    borderColor: `${colors.gold}35`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 42,
  },
  heroTitleAccent: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: spacing[4],
  },
  heroSubtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: spacing[8],
  },

  // ── Stats Row ─────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    ...shadows.card,
  },
  statPill: {
    alignItems: 'center',
    paddingHorizontal: spacing[3],
  },
  statPillNumber: {
    fontSize: typography.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
  },
  statPillLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.slate[700],
    marginHorizontal: spacing[2],
  },

  // ── Features Section ──────────────────────────────────────────────
  featuresSection: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  sectionLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing[4],
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.card,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${colors.leaf}12`,
    borderWidth: 1,
    borderColor: `${colors.leaf}25`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  featureTitle: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  featureDesc: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // ── Flow Section ──────────────────────────────────────────────────
  flowSection: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  flowTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    ...shadows.card,
  },
  flowNode: {
    alignItems: 'center',
    flex: 1,
  },
  flowStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  flowStepText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.bg,
  },
  flowIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.leaf}12`,
    borderWidth: 1,
    borderColor: `${colors.leaf}25`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  flowLabel: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },

  // ── Trust Section ─────────────────────────────────────────────────
  trustSection: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    alignItems: 'center',
  },
  trustRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  trustBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.gold}25`,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  trustText: {
    fontSize: typography.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // ── CTA Section ───────────────────────────────────────────────────
  ctaSection: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[10],
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  ctaSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing[6],
  },
  ctaButton: {
    marginBottom: spacing[4],
  },
  ctaSecondary: {
    padding: spacing[3],
  },
  ctaSecondaryText: {
    fontSize: typography.sm,
    color: colors.leaf,
    fontWeight: typography.fontWeight.semibold,
  },

  // ── Footer ───────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceHover,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: spacing[5],
    marginBottom: spacing[4],
  },
  footerLink: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  footerText: {
    fontSize: typography.xs,
    color: colors.slate[600],
  },
});

export default LandingScreen;
