import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminNavigator = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Admin Dashboard - Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  text: { fontSize: 18, color: '#1F2937' }
});

export default AdminNavigator;
