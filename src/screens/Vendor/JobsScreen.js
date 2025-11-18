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

const VendorJobsScreen = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Plumbing Repair', property: 'Riverside Apartments', unit: 'A-101', status: 'in_progress', amount: 5000, date: '2025-11-15', description: 'Fix leaking kitchen faucet' },
    { id: 2, title: 'AC Maintenance', property: 'Westlands Tower', unit: 'B-205', status: 'pending', amount: 8000, date: '2025-11-14', description: 'AC not cooling properly' },
    { id: 3, title: 'Electrical Work', property: 'Kilimani Plaza', unit: 'C-302', status: 'completed', amount: 12000, date: '2025-11-10', description: 'Install new circuit breaker' },
    { id: 4, title: 'Painting', property: 'Riverside Apartments', unit: 'D-405', status: 'pending', amount: 15000, date: '2025-11-16', description: 'Repaint living room and bedroom' },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#3B82F6',
      in_progress: '#F59E0B',
      completed: '#10B981',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const handleJobAction = (job, action) => {
    if (action === 'view') {
      setSelectedJob(job);
      setShowJobModal(true);
    } else if (action === 'accept') {
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: 'in_progress' } : j));
      Alert.alert('Success', 'Job accepted successfully!');
    } else if (action === 'complete') {
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: 'completed' } : j));
      Alert.alert('Success', 'Job marked as completed!');
    }
  };

  const filteredJobs = jobs.filter(job => filterStatus === 'all' || job.status === filterStatus);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
              {status === 'all' ? 'All Jobs' : status.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.jobsList}>
        {filteredJobs.map((job) => (
          <TouchableOpacity 
            key={job.id} 
            style={styles.jobCard}
            onPress={() => handleJobAction(job, 'view')}
          >
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                  {job.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            <Text style={styles.jobDescription}>{job.description}</Text>

            <View style={styles.jobDetails}>
              <View style={styles.jobDetailRow}>
                <Ionicons name="business-outline" size={16} color="#94A3B8" />
                <Text style={styles.jobDetailText}>{job.property}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="home-outline" size={16} color="#94A3B8" />
                <Text style={styles.jobDetailText}>Unit {job.unit}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                <Text style={styles.jobDetailText}>{job.date}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="cash-outline" size={16} color="#10B981" />
                <Text style={[styles.jobDetailText, { color: '#10B981', fontWeight: '600' }]}>
                  KSh {job.amount.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.jobActions}>
              {job.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleJobAction(job, 'accept')}
                >
                  <Text style={styles.actionButtonText}>Accept Job</Text>
                </TouchableOpacity>
              )}
              {job.status === 'in_progress' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
                  onPress={() => handleJobAction(job, 'complete')}
                >
                  <Text style={styles.actionButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showJobModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJobModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Job Details</Text>
            {selectedJob && (
              <ScrollView>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title:</Text>
                  <Text style={styles.detailValue}>{selectedJob.title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{selectedJob.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Property:</Text>
                  <Text style={styles.detailValue}>{selectedJob.property}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit:</Text>
                  <Text style={styles.detailValue}>{selectedJob.unit}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={[styles.detailValue, { color: '#10B981' }]}>
                    KSh {selectedJob.amount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{selectedJob.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{selectedJob.status.replace('_', ' ')}</Text>
                </View>
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowJobModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterChip: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  jobsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    flex: 1,
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
  jobDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  jobDetails: {
    gap: 8,
    marginBottom: 12,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDetailText: {
    fontSize: 13,
    color: '#94A3B8',
    marginLeft: 8,
  },
  jobActions: {
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VendorJobsScreen;
