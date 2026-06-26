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
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

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
        <ActivityIndicator size="large" color={colors.info} />
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
            <Text style={[styles.statNumber, { color: colors.warning }]}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.info }]}>{counts.assigned}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{counts.in_progress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{counts.completed}</Text>
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
                  <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{request.tenant?.firstName} {request.tenant?.lastName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{request.property?.name} - {request.unitNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{request.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{new Date(request.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>

              {request.contractor && (
                <View style={styles.assignmentInfo}>
                  <View style={styles.detailRow}>
                    <Ionicons name="construct-outline" size={16} color={colors.info} />
                    <Text style={styles.contractorText}>{request.contractor}</Text>
                  </View>
                  {request.estimatedCost > 0 && (
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color={colors.success} />
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
                      <Ionicons name="person-add-outline" size={18} color={colors.info} />
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
                      <Ionicons name="checkmark-outline" size={18} color={colors.success} />
                      <Text style={styles.actionButtonText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {requests.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={64} color={colors.textMuted} />
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
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing[5],
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
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
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  requestsList: {
    padding: spacing[5],
    paddingTop: 0,
  },
  requestCard: {
    backgroundColor: colors.surface,
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
    marginBottom: spacing[2],
  },
  requestTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestTitle: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  requestDetails: {
    marginBottom: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1] + 2,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
  assignmentInfo: {
    backgroundColor: colors.slate[800],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  contractorText: {
    fontSize: 13,
    color: colors.blue[400],
    marginLeft: spacing[2],
    fontWeight: typography.fontWeight.medium,
  },
  costText: {
    fontSize: 13,
    color: colors.success,
    marginLeft: spacing[2],
    fontWeight: typography.fontWeight.medium,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: 10,
    paddingVertical: spacing[1] + 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate[800],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginLeft: spacing[2],
  },
  actionButtonText: {
    fontSize: 13,
    color: colors.slate[200],
    marginLeft: spacing[1] + 2,
    fontWeight: typography.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing[6],
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing[5],
  },
  requestSummary: {
    backgroundColor: colors.slate[800],
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[5],
  },
  summaryTitle: {
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.slate[200],
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.slate[800],
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.base,
    marginBottom: spacing[5],
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: colors.slate[800],
    marginRight: spacing[2],
  },
  cancelButtonText: {
    color: colors.slate[200],
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  submitButton: {
    backgroundColor: colors.darkBlue,
    marginLeft: spacing[2],
  },
  submitButtonText: {
    color: colors.gold,
    fontSize: typography.base,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: typography.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing[4],
  },
  emptyStateSubtext: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing[2],
  },
});

export default LandlordMaintenanceScreen;
