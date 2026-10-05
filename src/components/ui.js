import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../config/theme';

// Small set of plain building blocks: left-aligned type, hairline rows, no tiles.

export const today = () =>
  new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' });

export const Heading = ({ eyebrow, title, right }) => (
  <View style={s.heading}>
    <View style={{ flex: 1 }}>
      {!!eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}
      <Text style={s.title} numberOfLines={1}>{title}</Text>
    </View>
    {right}
  </View>
);

export const Figure = ({ label, value, note }) => (
  <View style={s.figure}>
    <Text style={s.figureLabel}>{label}</Text>
    <Text style={s.figureValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    {!!note && <Text style={s.figureNote}>{note}</Text>}
  </View>
);

export const Section = ({ title, action, onAction }) => (
  <View style={s.section}>
    <Text style={s.sectionText}>{title}</Text>
    {!!action && (
      <TouchableOpacity onPress={onAction} hitSlop={8}>
        <Text style={s.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const Rows = ({ children }) => <View style={s.rows}>{children}</View>;

export const Row = ({ label, value, note, onPress, tone, cap }) => {
  const body = (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel} numberOfLines={1}>{label}</Text>
        {!!note && <Text style={s.rowNote} numberOfLines={1}>{note}</Text>}
      </View>
      {value !== undefined && value !== null && (
        <Text style={[s.rowValue, tone && { color: tone }, cap && { textTransform: 'capitalize' }]} numberOfLines={2}>{value}</Text>
      )}
      {!!onPress && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />}
    </View>
  );
  return onPress ? <TouchableOpacity activeOpacity={0.6} onPress={onPress}>{body}</TouchableOpacity> : body;
};

export const Field = ({ label, hint, style, ...input }) => (
  <View style={[s.field, style]}>
    {!!label && <Text style={s.fieldLabel}>{label}</Text>}
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...input}
      style={[s.input, input.multiline && s.inputMulti]}
    />
    {!!hint && <Text style={s.fieldHint}>{hint}</Text>}
  </View>
);

// Single choice from a short list. options: ['a','b'] or [{ value, label, disabled }].
export const Options = ({ label, options, value, onChange, style }) => (
  <View style={[s.field, style]}>
    {!!label && <Text style={s.fieldLabel}>{label}</Text>}
    <View style={s.optRow}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const on = value === opt.value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            disabled={opt.disabled}
            onPress={() => onChange(opt.value)}
            style={[s.opt, on && s.optOn, opt.disabled && { opacity: 0.4 }]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text style={[s.optText, on && s.optTextOn]} numberOfLines={1}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export const Sheet = ({ visible, title, onClose, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.backdrop}>
      <View style={s.sheet}>
        <View style={s.sheetHead}>
          <Text style={s.sheetTitle} numberOfLines={1}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Text style={s.sheetClose}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const s = StyleSheet.create({
  field: { marginBottom: spacing[4] },
  fieldLabel: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '600', marginBottom: 6 },
  fieldHint: { color: colors.textMuted, fontSize: typography.xs, marginTop: 4 },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: spacing[3], paddingVertical: 12, fontSize: typography.base, color: colors.textPrimary,
  },
  inputMulti: { minHeight: 96, textAlignVertical: 'top' },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  opt: { paddingHorizontal: spacing[3], paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  optText: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '600', textTransform: 'capitalize' },
  optTextOn: { color: colors.white },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,24,28,0.42)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing[5], paddingBottom: spacing[6], maxHeight: '92%' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] },
  sheetTitle: { flex: 1, color: colors.textPrimary, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  sheetClose: { color: colors.leaf, fontSize: typography.base, fontWeight: '600', marginLeft: spacing[3] },
  heading: { flexDirection: 'row', alignItems: 'flex-end', paddingTop: spacing[4], paddingBottom: spacing[5] },
  eyebrow: { color: colors.textMuted, fontSize: typography.sm, marginBottom: 2 },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  figure: { paddingBottom: spacing[5] },
  figureLabel: { color: colors.textSecondary, fontSize: typography.sm },
  figureValue: { color: colors.textPrimary, fontSize: 40, fontWeight: '700', letterSpacing: -1, marginTop: 2 },
  figureNote: { color: colors.textMuted, fontSize: typography.sm, marginTop: 2 },
  section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: spacing[5], marginBottom: spacing[1] },
  sectionText: { color: colors.textSecondary, fontSize: typography.sm, fontWeight: '600' },
  sectionAction: { color: colors.leaf, fontSize: typography.sm, fontWeight: '600' },
  rows: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  row: {
    flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.textPrimary, fontSize: typography.base },
  rowNote: { color: colors.textMuted, fontSize: typography.sm, marginTop: 1 },
  rowValue: { color: colors.textPrimary, fontSize: typography.base, fontWeight: '600', marginLeft: spacing[3], textAlign: 'right', maxWidth: '58%' },
});
