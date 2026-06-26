/**
 * Bulk theme migration script for NyumbaSync Mobile.
 * Replaces hardcoded hex colors with theme constants across all screen files.
 *
 * Usage:
 *   node scripts/migrate-theme.js
 *
 * BACKUP FIRST:
 *   git add . && git commit -m "before theme migration"
 *   # or: cp -r src/screens src/screens.backup
 */

const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.resolve(__dirname, '../src/screens');

// Color → theme constant mapping (most common patterns first)
const COLOR_MAP = {
  // Backgrounds
  "backgroundColor: '#020617'": "backgroundColor: colors.bg",
  "backgroundColor: '#0F172A'": "backgroundColor: colors.surface",
  "backgroundColor: '#1E293B'": "backgroundColor: colors.slate[800]",

  // Text colors
  "color: '#F8FAFC'": "color: colors.textPrimary",
  "color: '#E2E8F0'": "color: colors.slate[200]",
  "color: '#94A3B8'": "color: colors.textSecondary",
  "color: '#64748B'": "color: colors.textMuted",
  "color: '#3B82F6'": "color: colors.info",
  "color: '#10B981'": "color: colors.success",
  "color: '#F59E0B'": "color: colors.warning",
  "color: '#EF4444'": "color: colors.danger",
  "color: '#60A5FA'": "color: colors.blue[400]",
  "color: '#A855F7'": "color: colors.purple[500]",
  "color: '#93C5FD'": "color: colors.blue[300]",
  "color: '#1E3A8A'": "color: colors.indigo[900]",

  // Border colors (single quotes in StyleSheet)
  "borderLeftColor: '#3B82F6'": "borderLeftColor: colors.info",
  "borderLeftColor: '#F59E0B'": "borderLeftColor: colors.warning",
  "borderLeftColor: '#10B981'": "borderLeftColor: colors.success",
  "borderLeftColor: '#EF4444'": "borderLeftColor: colors.danger",
  "borderColor: '#3B82F6'": "borderColor: colors.info",
  "borderColor: '#F59E0B'": "borderColor: colors.warning",
  "borderColor: '#10B981'": "borderColor: colors.success",
  "borderColor: '#EF4444'": "borderColor: colors.danger",
  "borderBottomColor: '#3B82F6'": "borderBottomColor: colors.info",
  "borderBottomColor: '#F59E0B'": "borderBottomColor: colors.warning",
  "borderBottomColor: '#10B981'": "borderBottomColor: colors.success",
  "borderBottomColor: '#EF4444'": "borderBottomColor: colors.danger",

  // Icon colors (as string values in component props)
  'color="#3B82F6"': 'color={colors.info}',
  'color="#10B981"': 'color={colors.success}',
  'color="#F59E0B"': 'color={colors.warning}',
  'color="#EF4444"': 'color={colors.danger}',
  'color="#60A5FA"': 'color={colors.blue[400]}',
  'color="#A855F7"': 'color={colors.purple[500]}',
  'color="#94A3B8"': 'color={colors.textSecondary}',
  'color="#64748B"': 'color={colors.textMuted}',

  // tintColor in RefreshControl
  'tintColor="#F8FAFC"': 'tintColor={colors.textPrimary}',
  'tintColor="#3B82F6"': 'tintColor={colors.info}',
};

// Also handle double-quoted variants (in case some files use double quotes)
const DOUBLE_QUOTE_MAP = {};
Object.entries(COLOR_MAP).forEach(([key, val]) => {
  const doubleKey = key.replace(/'/g, '"');
  if (doubleKey !== key) {
    DOUBLE_QUOTE_MAP[doubleKey] = val;
  }
});

const ALL_REPLACEMENTS = { ...COLOR_MAP, ...DOUBLE_QUOTE_MAP };

// Find all .js files under screens/
function findScreenFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findScreenFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Check if file already imports theme
function hasThemeImport(content) {
  return /from ['"]\.\.\/\.\.\/config\/theme['"]/.test(content) ||
         /from ['"]\.\.\/\.\.\/\.\.\/config\/theme['"]/.test(content);
}

// Determine the relative import path from file to src/config/theme.js
function getRelativeImportPath(filePath) {
  const screensDir = path.resolve(__dirname, '../src/screens');
  const relativeToScreens = path.relative(screensDir, filePath);
  const depth = relativeToScreens.split(path.sep).length - 1;
  return '../'.repeat(depth + 1) + 'config/theme';
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Skip if already migrated
  if (hasThemeImport(content)) {
    console.log(`  SKIP (already themed): ${path.relative(SCREENS_DIR, filePath)}`);
    return false;
  }

  let replacements = 0;

  // Apply all replacements
  for (const [oldStr, newStr] of Object.entries(ALL_REPLACEMENTS)) {
    if (content.includes(oldStr)) {
      content = content.split(oldStr).join(newStr);
      replacements++;
    }
  }

  if (replacements === 0) {
    console.log(`  SKIP (no hardcoded colors): ${path.relative(SCREENS_DIR, filePath)}`);
    return false;
  }

  // Add theme import after existing imports
  const importPath = getRelativeImportPath(filePath);
  const importLine = `import { colors, spacing, typography, shadows, borderRadius } from '${importPath}';`;

  // Find the last import line
  const lines = content.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importLine);
    content = lines.join('\n');
  } else {
    // No imports found, add at top
    content = importLine + '\n' + content;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  MIGRATED (${replacements} replacements): ${path.relative(SCREENS_DIR, filePath)}`);
  return true;
}

// ── Main ────────────────────────────────────────────────────────────
console.log('\n🎨  NyumbaSync Mobile Theme Migration\n');
console.log('Scanning:', SCREENS_DIR);
console.log('');

const files = findScreenFiles(SCREENS_DIR);
console.log(`Found ${files.length} screen files\n`);

let migrated = 0;
let skipped = 0;
let errors = 0;

for (const file of files) {
  try {
    const didMigrate = migrateFile(file);
    if (didMigrate) migrated++;
    else skipped++;
  } catch (err) {
    console.error(`  ERROR: ${path.relative(SCREENS_DIR, file)} — ${err.message}`);
    errors++;
  }
}

console.log(`\n✅  ${migrated} files migrated`);
console.log(`⏭️  ${skipped} files skipped (already themed or no hardcoded colors)`);
if (errors > 0) console.log(`❌  ${errors} errors`);
console.log('');
console.log('Next steps:');
console.log('  1. Review the migrated files for any missed colors');
console.log('  2. Test the app: npx expo start');
console.log('  3. Run: node scripts/migrate-theme.js --check  (to find remaining hardcoded colors)');
console.log('');

// ── Check mode ──────────────────────────────────────────────────────
if (process.argv.includes('--check')) {
  console.log('🔍  Remaining hardcoded colors:\n');
  const HEX_COLOR_REGEX = /#[0-9A-Fa-f]{6}/g;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (hasThemeImport(content)) continue; // skip themed files
    const matches = content.match(HEX_COLOR_REGEX);
    if (matches) {
      const unique = [...new Set(matches)];
      console.log(`  ${path.relative(SCREENS_DIR, file)}: ${unique.join(', ')}`);
    }
  }
}
