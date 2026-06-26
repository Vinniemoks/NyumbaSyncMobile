import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const MaintenanceScreen = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
  });
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'Leaking faucet',
      description: 'Kitchen faucet is leaking',
      category: 'plumbing',
      priority: 'high',
      status: 'in_progress',
      date: '2025-11-15',
    },
    {
      id: 2,
      title: 'AC not cooling',
      description: 'Air conditioner not working properly',
      category: 'hvac',
      priority: 'urgent',
      status: 'assigned',
      date: '2025-11-14',
    },
  ]);

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setRequests([
      {
        id: Date.now(),
        ...formData,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      },
      ...requests,
    ]);

    setFormData({ title: '', description: '', category: 'plumbing', priority: 'medium' });
    setShowForm(false);
    Alert.alert('Success', 'Maintenance request submitted successfully!');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      assigned: '#3B82F6',
      in_progress: '#8B5CF6',
      completed: '#10B981',
    };
    return colors[status] || '#6B7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#6B7280',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626',
    };
    return colors[priority] || '#6B7280';
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.statsRow}>
          {['pending', 'assigned', 'in_progress', 'completed'].map((status) => (
            <View key={status} style={styles.statBox}>
              <Text style={styles.statNumber}>
                {requests.filter((r) => r.status === status).length}
              </Text>
              <Text style={styles.statLabel}>{status.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.requestsList}>
          {requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestTitle}>{request.title}</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(request.priority) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: getPriorityColor(request.priority) },
                    ]}
                  >
                    {request.priority}
                  </Text>
                </View>
              </View>

              <Text style={styles.requestDescription}>{request.description}</Text>

              <View style={styles.requestFooter}>
                <View style={styles.requestMeta}>
                  <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{request.category}</Text>
                </View>
                <View style={styles.requestMeta}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.metaText}>{request.date}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: getStatusColor(request.status) }]}
                  >
                    {request.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowForm(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Maintenance Request</Text>

            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="e.g., Leaking faucet"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.pickerContainer}>
              {['plumbing', 'electrical', 'hvac', 'appliance', 'other'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pickerOption,
                    formData.category === cat && styles.pickerOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat })}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      formData.category === cat && styles.pickerTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.pickerContainer}>
              {['low', 'medium', 'high', 'urgent'].map((pri) => (
                <TouchableOpacity
                  key={pri}
                  style={[
                    styles.pickerOption,
                    formData.priority === pri && styles.pickerOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, priority: pri })}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      formData.priority === pri && styles.pickerTextSelected,
                    ]}
                  >
                    {pri}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Describe the issue in detail..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg, // slate-950
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing[5],
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface, // slate-900
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary, // slate-400
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  requestsList: {
    padding: spacing[5],
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: colors.surface, // slate-900
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  requestTitle: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary, // slate-50
  },
  priorityBadge: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    marginLeft: spacing[2],
  },
  priorityText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  requestDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary, // slate-400
    marginBottom: spacing[3],
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  metaText: {
    fontSize: typography.xs,
    color: colors.textSecondary, // slate-400
    marginLeft: spacing[1],
  },
  statusBadge: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface, // slate-900
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing[6],
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary, // slate-50
    marginBottom: spacing[6],
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200], // slate-200
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.slate[800], // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.base,
    marginBottom: spacing[5],
    color: colors.textPrimary, // slate-50
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[5],
  },
  pickerOption: {
    backgroundColor: colors.slate[800], // slate-800
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  pickerOptionSelected: {
    backgroundColor: colors.darkBlue, 
  },
  pickerText: {
    fontSize: typography.sm,
    color: colors.textSecondary, // slate-400
    textTransform: 'capitalize',
  },
  pickerTextSelected: {
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing[6],
  },
  modalButton: {
    flex: 1,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.slate[800], // slate-800
    marginRight: spacing[2],
  },
  cancelButtonText: {
    color: colors.slate[200], // slate-200
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  submitButton: {
    backgroundColor: '#10B981',
    marginLeft: spacing[2],
  },
  submitButtonText: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default MaintenanceScreen;
