/**
 * NyumbaSync mobile theme — single source of truth for colors.
 *
 * Mirrors the web app's "dark slate + green, royal-gold trim" look:
 *  - dark slate canvas + glassy surfaces
 *  - GREEN is the functional/interactive accent (buttons, links, active controls)
 *  - GOLD is the executive trim (brand wordmark, active navigation, key highlights)
 *
 * Prefer importing from here instead of hardcoding hex values so the palette
 * stays consistent across screens (and matches the web/desktop apps).
 */
export const colors = {
  // Canvas / surfaces
  bg: '#0A1628',          // deep slate
  surface: '#0F172A',     // slate-900
  surfaceAlt: '#1E293B',  // slate-800
  border: '#334155',      // slate-700

  // Text
  text: '#F8FAFC',        // slate-50
  textMuted: '#94A3B8',   // slate-400
  textSubtle: '#64748B',  // slate-500

  // Functional accent — GREEN
  primary: '#14532D',     // green-900
  primaryDark: '#052E16', // green-950
  primaryLight: '#16A34A',// green-600

  // Leaf palette (web brand)
  leaf: '#22C55E',        // green-500
  leafDeep: '#14532D',    // green-900
  leafTint: '#DCFCE7',    // green-100

  // Executive accent — ROYAL GOLD
  gold: '#C9A24B',
  goldLight: '#E6C766',
  goldDark: '#B8860B',

  // Backwards-compatible alias used by legacy components
  darkBlue: '#0A1628',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
};

export default colors;
