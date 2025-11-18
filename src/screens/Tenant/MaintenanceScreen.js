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
    backgroundColor: '#020617', // slate-950
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8', // slate-400
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  requestsList: {
    padding: 20,
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: '#0F172A', // slate-900
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  requestTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC', // slate-50
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  requestDescription: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginLeft: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
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
    backgroundColor: '#0F172A', // slate-900
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC', // slate-50
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0', // slate-200
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B', // slate-800
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#F8FAFC', // slate-50
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  pickerOption: {
    backgroundColor: '#1E293B', // slate-800
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#6366F1', // indigo-500
  },
  pickerText: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
    textTransform: 'capitalize',
  },
  pickerTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1E293B', // slate-800
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#E2E8F0', // slate-200
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MaintenanceScreen;
