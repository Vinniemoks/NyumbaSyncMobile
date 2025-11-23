import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { maintenanceService } from '../../services/api';

const LandlordMaintenanceScreen = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({
    contractor: '',
    estimatedCost: '',
    notes: '',
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await maintenanceService.getByLandlord();
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
      Alert.alert('Error', 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleAssign = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  const handleSubmitAssignment = async () => {
    if (!assignData.contractor) {
      Alert.alert('Error', 'Please enter contractor name');
      return;
    }

    try {
      const response = await maintenanceService.update(selectedRequest.id, {
        status: 'assigned',
        contractor: assignData.contractor,
        estimatedCost: parseFloat(assignData.estimatedCost) || 0,
        notes: assignData.notes,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Maintenance request assigned successfully!');
        setAssignData({ contractor: '', estimatedCost: '', notes: '' });
        setShowAssignModal(false);
        loadRequests();
      }
    } catch (error) {
      console.error('Error assigning request:', error);
      Alert.alert('Error', 'Failed to assign request');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const response = await maintenanceService.update(requestId, { status: newStatus });
      if (response.data.success) {
        Alert.alert('Success', `Status updated to ${newStatus.replace('_', ' ')}`);
        loadRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
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

  const getStatusCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      assigned: requests.filter(r => r.status === 'assigned').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{counts.assigned}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{counts.in_progress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{counts.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.requestsList}>
          {requests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestTitleRow}>
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
              </View>

              <Text style={styles.requestDescription}>{request.description}</Text>

              <View style={styles.requestDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{request.tenant?.firstName} {request.tenant?.lastName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{request.property?.name} - {request.unitNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{request.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                  <Text style={styles.detailText}>{new Date(request.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>

              {request.contractor && (
                <View style={styles.assignmentInfo}>
                  <View style={styles.detailRow}>
                    <Ionicons name="construct-outline" size={16} color="#6366F1" />
                    <Text style={styles.contractorText}>{request.contractor}</Text>
                  </View>
                  {request.estimatedCost > 0 && (
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color="#10B981" />
                      <Text style={styles.costText}>KSh {request.estimatedCost.toLocaleString()}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.requestFooter}>
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

                <View style={styles.actionButtons}>
                  {request.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleAssign(request)}
                    >
                      <Ionicons name="person-add-outline" size={18} color="#6366F1" />
                      <Text style={styles.actionButtonText}>Assign</Text>
                    </TouchableOpacity>
                  )}
                  {request.status === 'assigned' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleUpdateStatus(request.id, 'in_progress')}
                    >
                      <Ionicons name="play-outline" size={18} color="#8B5CF6" />
                      <Text style={styles.actionButtonText}>Start</Text>
                    </TouchableOpacity>
                  )}
                  {request.status === 'in_progress' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleUpdateStatus(request.id, 'completed')}
                    >
                      <Ionicons name="checkmark-outline" size={18} color="#10B981" />
                      <Text style={styles.actionButtonText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {requests.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={64} color="#64748B" />
              <Text style={styles.emptyStateText}>No maintenance requests</Text>
              <Text style={styles.emptyStateSubtext}>Requests from your tenants will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Maintenance Request</Text>

            {selectedRequest && (
              <View style={styles.requestSummary}>
                <Text style={styles.summaryTitle}>{selectedRequest.title}</Text>
                <Text style={styles.summaryText}>{selectedRequest.property?.name} - {selectedRequest.unitNumber}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Contractor Name *</Text>
            <TextInput
              style={styles.input}
              value={assignData.contractor}
              onChangeText={(text) => setAssignData({ ...assignData, contractor: text })}
              placeholder="e.g., ABC Plumbing Services"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.inputLabel}>Estimated Cost (KSh)</Text>
            <TextInput
              style={styles.input}
              value={assignData.estimatedCost}
              onChangeText={(text) => setAssignData({ ...assignData, estimatedCost: text })}
              placeholder="e.g., 5000"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={assignData.notes}
              onChangeText={(text) => setAssignData({ ...assignData, notes: text })}
              placeholder="Additional notes for the contractor..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAssignModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitAssignment}
              >
                <Text style={styles.submitButtonText}>Assign</Text>
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
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  requestsList: {
    padding: 20,
    paddingTop: 0,
  },
  requestCard: {
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
  requestHeader: {
    marginBottom: 8,
  },
  requestTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
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
    color: '#94A3B8',
    marginBottom: 12,
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 8,
  },
  assignmentInfo: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contractorText: {
    fontSize: 13,
    color: '#818CF8',
    marginLeft: 8,
    fontWeight: '500',
  },
  costText: {
    fontSize: 13,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: '500',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#E2E8F0',
    marginLeft: 6,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  requestSummary: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: '#F8FAFC',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
});

export default LandlordMaintenanceScreen;
