/**
 * NyumbaSync Mobile Theme
 * Single source of truth for colors, spacing, typography, and shadows.
 * Matches the web app's Tailwind configuration exactly.
 *
 * Usage:
 *   import { colors, spacing, typography, shadows } from '../config/theme';
 *   // colors.slate[950] -> '#020617'
 *   // colors.primary -> '#2563eb'
 */

// ── Colors ──────────────────────────────────────────────────────────
// Aligned with web app's Tailwind config and index.css

const slate = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
};

const blue = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554',
};

const green = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16',
};

const amber = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
};

const red = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
};

const purple = {
  50: '#FAF5FF',
  100: '#F3E8FF',
  200: '#E9D5FF',
  300: '#D8B4FE',
  400: '#C084FC',
  500: '#A855F7',
  600: '#9333EA',
  700: '#7E22CE',
  800: '#6B21A8',
  900: '#581C87',
  950: '#3B0764',
};

const indigo = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
  950: '#1E1B4B',
};

const gold = {
  DEFAULT: '#D4AF37',
  100: '#F5E6C8',
  200: '#EAD08A',
  300: '#DFBA4C',
  400: '#D4AF37',
  500: '#B8960F',
  600: '#9A7D0A',
  700: '#7A6208',
  light: '#E8C84A',
  dark: '#8B6914',
};

const colors = {
  // Semantic aliases (green-first, aligned with the redesigned web app)
  primary: green[900],       // '#14532D'
  primaryDark: green[950],   // '#052E16'
  primaryLight: green[600],  // '#16A34A'
  secondary: green[500],     // '#22C55E'
  success: green[500],       // '#22C55E'
  warning: amber[500],       // '#F59E0B'
  danger: red[500],          // '#EF4444'
  info: blue[500],           // '#3B82F6'

  // Leaf brand palette
  leaf: green[500],          // '#22C55E'
  leafDeep: green[900],      // '#14532D'
  leafTint: green[100],      // '#DCFCE7'

  // Rent-specific aliases
  'rent-paid': green[500],
  'rent-due': amber[500],
  'rent-overdue': red[500],

  // Full palettes
  slate,
  blue,
  green,
  amber,
  red,
  purple,
  indigo,
  gold,

  // Shorthand access for the most common dark-theme colors
  bg: '#0A1628',             // page background (deep slate)
  surface: slate[900],       // card / section background
  surfaceAlt: slate[800],    // alternate card background
  surfaceHover: slate[800],  // hover state
  border: slate[700],        // borders
  textPrimary: slate[50],    // main text
  textSecondary: slate[400], // subtitles, labels
  textMuted: slate[500],     // hints, disabled
  // Backwards-compatible alias used by legacy components
  darkBlue: '#0A1628',

  // Backward-compatible flat aliases
  gold: gold.DEFAULT,        // string alias for Ionicons etc.
  white: '#FFFFFF',
  black: '#000000',
};

// ── Spacing ─────────────────────────────────────────────────────────
// Mirrors Tailwind's default spacing scale (4px = 1 unit)

const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// ── Typography ──────────────────────────────────────────────────────
// Font sizes mapped to Tailwind's type scale

const typography = {
  xs: 12,      // text-xs
  sm: 14,      // text-sm
  base: 16,    // text-base
  lg: 18,      // text-lg
  xl: 20,      // text-xl
  '2xl': 24,   // text-2xl
  '3xl': 30,   // text-3xl
  '4xl': 36,   // text-4xl
  fontFamily: {
    // Web uses Poppins; mobile falls back to system fonts
    sans: 'Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, sans-serif',
    mono: 'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// ── Shadows ─────────────────────────────────────────────────────────
// Matches web Tailwind boxShadow values

const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gold: {
    shadowColor: gold.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// ── Border Radius ───────────────────────────────────────────────────
// Matches Tailwind's rounded scale

const borderRadius = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// ── Shared StyleSheet helpers ───────────────────────────────────────
// Pre-composed styles that are reused across many screens

const commonStyles = {
  // ── Layout ────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flexWrapBetween: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // ── Header (dashboard top) ────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[5],
    backgroundColor: colors.surface,
  },
  headerCentered: {
    backgroundColor: colors.surface,
    padding: spacing[5],
    alignItems: 'center',
  },
  greeting: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing[2],
    textAlign: 'center',
    paddingHorizontal: spacing[5],
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.lg,
    marginTop: spacing[2],
  },
  roleText: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },

  // ── Section ───────────────────────────────────────────────────────
  section: {
    padding: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },

  // ── Cards ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.card,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.card,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    margin: '1%',
    alignItems: 'center',
    ...shadows.card,
  },
  statCardFull: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 4,
    ...shadows.card,
  },
  statValue: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing[2],
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  statIcon: {
    marginRight: spacing[4],
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  statSubtitle: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    alignItems: 'center',
    marginBottom: spacing[3],
    ...shadows.card,
  },
  actionCardText: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginTop: spacing[2],
  },
  propertyInfo: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    ...shadows.card,
  },
  propertyAddress: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  propertyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // ── Buttons ───────────────────────────────────────────────────────
  // Green primary buttons with gold lettering/border for contrast.

  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.gold + '50',
    ...shadows.card,
  },
  buttonAccept: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.gold + '50',
    ...shadows.card,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold + '50',
    ...shadows.card,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold + '50',
    ...shadows.card,
  },
  buttonDanger: {
    backgroundColor: colors.danger + '18',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger + '40',
    ...shadows.card,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonTextPrimary: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonTextMuted: {
    color: colors.textMuted,
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  linkButton: {
    marginTop: spacing[5],
    alignItems: 'center',
  },

  // ── Inputs & Forms ───────────────────────────────────────────────
  form: {
    width: '100%',
    maxWidth: 400,
  },
  formGroup: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.slate[700],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  placeholder: {
    color: colors.textMuted,
  },

  // ── Lists & Activity Items ────────────────────────────────────────
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.card,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.card,
  },
  activityIcon: {
    marginRight: spacing[3],
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[0.5] || 2,
  },
  listItemSubtitle: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  listItemMeta: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },

  // ── Text ─────────────────────────────────────────────────────────
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textMuted: {
    color: colors.textMuted,
  },
  textSuccess: {
    color: colors.success,
  },
  textWarning: {
    color: colors.warning,
  },
  textDanger: {
    color: colors.danger,
  },
  textLink: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  textLinkBold: {
    color: colors.blue[400],
    fontWeight: typography.fontWeight.semibold,
  },
  textCenter: {
    textAlign: 'center',
  },

  // ── Tags & Badges ────────────────────────────────────────────────
  tag: {
    backgroundColor: indigo[900],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  tagText: {
    fontSize: typography.xs,
    color: indigo[300],
    fontWeight: typography.fontWeight.medium,
  },
  badgeSuccess: {
    backgroundColor: green[900],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.lg,
  },
  badgeWarning: {
    backgroundColor: amber[900],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.lg,
  },
  badgeDanger: {
    backgroundColor: red[900],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.lg,
  },
  badgeTextSuccess: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.semibold,
    color: green[200],
  },
  badgeTextWarning: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.semibold,
    color: amber[200],
  },
  badgeTextDanger: {
    fontSize: typography.xs,
    fontWeight: typography.fontWeight.semibold,
    color: red[200],
  },

  // ── Dividers ──────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[4],
  },
  dividerLight: {
    height: 1,
    backgroundColor: colors.slate[800],
    marginVertical: spacing[2],
  },

  // ── Empty / Loading ───────────────────────────────────────────────
  emptyState: {
    color: colors.textMuted,
    padding: spacing[4],
    textAlign: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
  },

  // ── Logo / Brand ──────────────────────────────────────────────────
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
};

export {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  commonStyles,
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  commonStyles,
};
