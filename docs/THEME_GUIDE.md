# Mobile Theme & CommonStyles Guide

## Overview

All mobile screens now share a single theme file: `src/config/theme.js`. This file mirrors the web app's Tailwind configuration exactly, so changing a color in one place updates all three platforms (web, desktop, mobile).

## Quick Reference

### Importing the Theme

```javascript
// Full import (recommended)
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../../config/theme';

// Minimal import (colors only)
import { colors } from '../../config/theme';
```

### Using Colors

```javascript
// Semantic colors (match web Tailwind)
colors.primary     // '#2563eb'
colors.success     // '#22C55E'
colors.warning     // '#F59E0B'
colors.danger      // '#EF4444'
colors.info        // '#3B82F6'
colors.gold        // '#C9A24B'

// Dark theme shorthands
colors.bg               // '#020617' (page background)
colors.surface          // '#0F172A' (card background)
colors.surfaceHover     // '#1E293B' (hover state)
colors.border           // '#334155' (borders)
colors.textPrimary      // '#F8FAFC' (main text)
colors.textSecondary    // '#94A3B8' (labels, subtitles)
colors.textMuted        // '#64748B' (hints, disabled)

// Full palettes
colors.slate[50]   // '#F8FAFC'
colors.slate[950]  // '#020617'
colors.blue[500]   // '#3B82F6'
colors.blue[400]   // '#60A5FA'
colors.green[500]  // '#22C55E'
colors.amber[500]  // '#F59E0B'
colors.red[500]    // '#EF4444'
colors.purple[500] // '#A855F7'
colors.indigo[900] // '#1E3A8A'
colors.gold.light  // '#E6C766'
colors.gold.dark   // '#B8860B'
```

### Using Spacing

```javascript
spacing[0]   // 0
spacing[1]   // 4
spacing[2]   // 8
spacing[3]   // 12
spacing[4]   // 16
spacing[5]   // 20
spacing[6]   // 24
spacing[8]   // 32
spacing[10]  // 40
spacing[12]  // 48
```

### Using Typography

```javascript
typography.xs      // 12
typography.sm      // 14
typography.base    // 16
typography.lg      // 18
typography.xl      // 20
typography['2xl']  // 24
typography['3xl']  // 30
typography['4xl']  // 36

typography.fontWeight.normal    // '400'
typography.fontWeight.medium    // '500'
typography.fontWeight.semibold  // '600'
typography.fontWeight.bold      // '700'
```

### Using Shadows

```javascript
// Card shadow (default)
...shadows.card

// Card hover (deeper)
...shadows.cardHover

// Gold accent shadow
...shadows.gold

// No shadow
...shadows.none
```

### Using Border Radius

```javascript
borderRadius.none    // 0
borderRadius.sm      // 2
borderRadius.DEFAULT // 4
borderRadius.md      // 6
borderRadius.lg      // 8
borderRadius.xl      // 12
borderRadius['2xl']  // 16
borderRadius['3xl']  // 24
borderRadius.full    // 9999
```

## CommonStyles Reference

### Layout

```javascript
commonStyles.container          // flex:1, bg: slate-950
commonStyles.centered           // justifyContent: center, alignItems: center
commonStyles.content            // flex:1, centered, padding: 20
commonStyles.row                // flexDirection: row, alignItems: center
commonStyles.rowBetween         // flexDirection: row, justifyContent: space-between
commonStyles.flexWrap           // flexDirection: row, flexWrap: wrap
commonStyles.flexWrapBetween    // flexDirection: row, flexWrap: wrap, justifyContent: space-between
```

### Header

```javascript
commonStyles.header             // row between, padding: 20, bg: slate-900
commonStyles.headerCentered     // bg: slate-900, padding: 20, centered
commonStyles.greeting           // fontSize: 14, color: slate-400
commonStyles.userName           // fontSize: 24, bold, color: slate-50
commonStyles.subtitle           // fontSize: 16, color: slate-400, centered
commonStyles.title              // fontSize: 30, bold, color: slate-50, centered
```

### Section

```javascript
commonStyles.section            // padding: 20
commonStyles.sectionTitle       // fontSize: 18, bold, color: slate-50, marginBottom: 16
```

### Cards

```javascript
commonStyles.card               // bg: slate-900, rounded-xl, padding: 16, shadow
commonStyles.cardRow            // card + flexDirection: row
commonStyles.statCard           // width: 48%, bg: slate-900, rounded-xl, padding: 20, centered, shadow
commonStyles.statCardFull       // row card with borderLeftWidth: 4
commonStyles.statValue          // fontSize: 24, bold, color: slate-50
commonStyles.statLabel          // fontSize: 12, color: slate-400
commonStyles.statIcon           // marginRight: 16, centered
commonStyles.statContent        // flex: 1
commonStyles.statTitle          // fontSize: 12, color: slate-400
commonStyles.statSubtitle       // fontSize: 12, color: slate-500
commonStyles.actionCard         // width: 48%, bg: slate-900, rounded-xl, padding: 20, centered, shadow
commonStyles.actionCardText     // fontSize: 14, semibold, color: slate-200
commonStyles.propertyInfo       // bg: slate-900, rounded-xl, padding: 16, shadow
commonStyles.propertyAddress    // fontSize: 16, semibold, color: slate-50
commonStyles.propertyDetails    // flexDirection: row, flexWrap: wrap
```

### Buttons

```javascript
commonStyles.button             // bg: info, rounded-lg, padding: 16, centered, shadow
commonStyles.buttonPrimary      // bg: primary, rounded-lg, padding: 16, centered
commonStyles.buttonSecondary    // bg: success, rounded-lg, padding: 16, centered
commonStyles.buttonDanger       // bg: danger, rounded-lg, padding: 16, centered
commonStyles.buttonOutline      // transparent, border, rounded-lg, padding: 16, centered
commonStyles.buttonText         // white, fontSize: 16, semibold
commonStyles.buttonTextPrimary  // primary, fontSize: 16, semibold
commonStyles.buttonTextMuted    // muted, fontSize: 14, semibold
commonStyles.linkButton         // marginTop: 20, centered
```

### Inputs & Forms

```javascript
commonStyles.form               // width: 100%, maxWidth: 400
commonStyles.formGroup          // marginBottom: 16
commonStyles.label              // fontSize: 14, semibold, color: slate-200
commonStyles.input              // bg: slate-900, border, rounded-lg, padding: 16
commonStyles.inputError         // borderColor: danger
commonStyles.placeholder        // color: slate-500 (use as placeholderTextColor)
```

### Lists & Activity Items

```javascript
commonStyles.listItem           // row, bg: slate-900, rounded-xl, padding: 16, shadow
commonStyles.activityItem       // same as listItem (semantic alias)
commonStyles.activityIcon       // marginRight: 12
commonStyles.listItemContent    // flex: 1
commonStyles.listItemTitle      // fontSize: 14, semibold, color: slate-50
commonStyles.listItemSubtitle   // fontSize: 12, color: slate-400
commonStyles.listItemMeta       // fontSize: 12, color: slate-500
```

### Text Styles

```javascript
commonStyles.textPrimary        // color: slate-50
commonStyles.textSecondary      // color: slate-400
commonStyles.textMuted          // color: slate-500
commonStyles.textSuccess        // color: green-500
commonStyles.textWarning        // color: amber-500
commonStyles.textDanger         // color: red-500
commonStyles.textLink           // color: slate-400, fontSize: 14
commonStyles.textLinkBold       // color: blue-400, fontWeight: semibold
commonStyles.textCenter         // textAlign: center
```

### Tags & Badges

```javascript
commonStyles.tag                // bg: indigo-900, rounded-full, padding
commonStyles.tagText            // fontSize: 12, color: indigo-300
commonStyles.badgeSuccess       // bg: green-900, rounded-lg, padding
commonStyles.badgeWarning       // bg: amber-900, rounded-lg, padding
commonStyles.badgeDanger        // bg: red-900, rounded-lg, padding
commonStyles.badgeTextSuccess   // fontSize: 12, semibold, color: green-200
commonStyles.badgeTextWarning   // fontSize: 12, semibold, color: amber-200
commonStyles.badgeTextDanger    // fontSize: 12, semibold, color: red-200
```

### Dividers

```javascript
commonStyles.divider            // height: 1, bg: slate-700, marginVertical: 16
commonStyles.dividerLight       // height: 1, bg: slate-800, marginVertical: 8
```

### Empty & Loading States

```javascript
commonStyles.emptyState         // color: slate-500, padding: 16, centered
commonStyles.loadingText        // color: slate-400
```

### Brand

```javascript
commonStyles.logoBadge          // 76x76, gold-tinted badge with border
```

## Example: Refactoring a Screen to Use commonStyles

### Before (hardcoded)

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### After (using commonStyles)

```javascript
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../../config/theme';

// In JSX:
<View style={commonStyles.container}>
  <View style={commonStyles.header}>
    <Text style={commonStyles.userName}>Dashboard</Text>
  </View>
  <View style={commonStyles.section}>
    <Text style={commonStyles.sectionTitle}>Overview</Text>
    <View style={commonStyles.card}>
      <Text style={commonStyles.textPrimary}>Content here</Text>
    </View>
  </View>
</View>

// Only screen-specific styles need StyleSheet:
const styles = StyleSheet.create({
  customThing: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info, // dynamic per instance
  },
});
```

## Adding a New Screen

Always import from theme and use commonStyles for standard patterns:

```javascript
import { colors, spacing, typography, shadows, borderRadius, commonStyles } from '../../config/theme';

// Use commonStyles for layout, headers, cards, buttons, inputs, etc.
// Only define custom styles for screen-specific variations.
```
