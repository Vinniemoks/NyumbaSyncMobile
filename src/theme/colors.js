/**
 * NyumbaSync mobile theme — single source of truth for colors.
 *
 * Mirrors the web app's "dark slate + blue, royal-gold trim" look:
 *  - dark slate canvas + glassy surfaces
 *  - BLUE is the functional/interactive accent (buttons, links, active controls)
 *  - GOLD is the executive trim (brand wordmark, active navigation, key highlights)
 *
 * Prefer importing from here instead of hardcoding hex values so the palette
 * stays consistent across screens (and matches the web/desktop apps).
 */
export const colors = {
  // Canvas / surfaces
  bg: '#020617',          // slate-950
  surface: '#0F172A',     // slate-900
  surfaceAlt: '#1E293B',  // slate-800
  border: '#334155',      // slate-700

  // Text
  text: '#F8FAFC',        // slate-50
  textMuted: '#94A3B8',   // slate-400
  textSubtle: '#64748B',  // slate-500

  // Functional accent — BLUE (matches web)
  primary: '#3B82F6',     // blue-500
  primaryDark: '#2563EB', // blue-600
  primaryLight: '#60A5FA',// blue-400

  // Executive accent — ROYAL GOLD
  gold: '#C9A24B',
  goldLight: '#E6C766',
  goldDark: '#B8860B',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
};

export default colors;
