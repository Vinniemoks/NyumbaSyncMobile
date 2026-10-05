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
  const [requests, setRequests] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  // GET /maintenance is role-aware: a landlord gets the requests for their properties.
  const loadRequests = async () => {
    try {
      const { data } = await maintenanceService.getAll();
      setRequests(
        (Array.isArray(data) ? data : []).map((r) => ({
          ...r,
          id: String(r.id || r._id),
          // the API's first status is "reported"; this screen calls it "pending"
          status: r.status === 'reported' ? 'pending' : r.status,
          tenantName: r.tenantName || '',
        }))
      );
      setLoadError(false);
    } catch (error) {
      setRequests([]);
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await maintenanceService.update(requestId, { status: newStatus });
      loadRequests();
    } catch (error) {
      Alert.alert('Could not update', error.response?.data?.error || 'Please try again.');
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
        <Text style={styles.summary}>
          {counts.pending} pending · {counts.assigned} assigned · {counts.in_progress} in progress · {counts.completed} done
        </Text>

        <View style={{ paddingHorizontal: spacing[5] }}>
          {requests.map((request) => (
            <View key={request.id} style={styles.req}>
              <View style={styles.reqTop}>
                <Text style={styles.reqTitle} numberOfLines={1}>{request.title}</Text>
                <Text style={[styles.reqPriority, { color: getPriorityColor(request.priority) }]}>{request.priority}</Text>
              </View>
              {!!request.description && <Text style={styles.reqDesc}>{request.description}</Text>}
              <Text style={styles.reqMeta}>
                {[request.tenantName, request.property, new Date(request.createdAt).toLocaleDateString()].filter(Boolean).join(' · ')}
              </Text>
              <View style={styles.reqBottom}>
                <Text style={[styles.reqStatus, { color: getStatusColor(request.status) }]}>
                  {request.status.replace('_', ' ')}
                </Text>
                {['pending', 'assigned'].includes(request.status) && (
                  <TouchableOpacity onPress={() => handleUpdateStatus(request.id, 'in_progress')} hitSlop={8}>
                    <Text style={styles.reqAction}>Start work</Text>
                  </TouchableOpacity>
                )}
                {request.status === 'in_progress' && (
                  <TouchableOpacity onPress={() => handleUpdateStatus(request.id, 'completed')} hitSlop={8}>
                    <Text style={styles.reqAction}>Mark complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {requests.length === 0 && (
            <Text style={styles.reqEmpty}>
              {loadError ? 'Could not load requests. Pull down to try again.' : 'No maintenance requests. Requests from your tenants will appear here.'}
            </Text>
          )}
        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  summary: { color: colors.textSecondary, fontSize: typography.sm, paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
  req: { paddingVertical: spacing[4], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  reqTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  reqTitle: { flex: 1, color: colors.textPrimary, fontSize: typography.base, fontWeight: '600', textTransform: 'capitalize' },
  reqPriority: { fontSize: typography.sm, fontWeight: '600', marginLeft: spacing[3], textTransform: 'capitalize' },
  reqDesc: { color: colors.textPrimary, fontSize: typography.sm, marginTop: 4 },
  reqMeta: { color: colors.textMuted, fontSize: typography.sm, marginTop: 4 },
  reqBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing[3] },
  reqStatus: { fontSize: typography.sm, fontWeight: '600', textTransform: 'capitalize' },
  reqAction: { color: colors.leaf, fontSize: typography.sm, fontWeight: '700' },
  reqEmpty: { color: colors.textSecondary, paddingVertical: spacing[5] },
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
    borderColor: colors.border,
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
