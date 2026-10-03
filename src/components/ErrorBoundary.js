import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors, spacing, typography, commonStyles } from '../config/theme';
import Button from './Button';
import { recordCrash } from '../utils/crashReporter';

// A render error in one screen shows this instead of closing the app.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    recordCrash(error, true);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <View style={[commonStyles.container, { padding: spacing[5], justifyContent: 'center' }]}>
        <Text style={{ color: colors.textPrimary, fontSize: typography['2xl'], fontWeight: '700' }}>Something went wrong</Text>
        <ScrollView style={{ maxHeight: 220, marginVertical: spacing[4] }}>
          <Text selectable style={{ color: colors.textMuted, fontSize: typography.xs }}>
            {error?.message || String(error)}
          </Text>
        </ScrollView>
        <Button title="Try again" onPress={() => this.setState({ error: null })} />
      </View>
    );
  }
}
