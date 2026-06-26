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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { documentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const DocumentsScreen = ({ userType = 'tenant' }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'lease',
    description: '',
    file: null,
  });

  const categories = [
    { id: 'all', name: 'All Documents', icon: 'folder-outline' },
    { id: 'lease', name: 'Lease Agreements', icon: 'document-text-outline' },
    { id: 'receipt', name: 'Receipts', icon: 'receipt-outline' },
    { id: 'inspection', name: 'Inspections', icon: 'clipboard-outline' },
    { id: 'maintenance', name: 'Maintenance', icon: 'construct-outline' },
    { id: 'notice', name: 'Notices', icon: 'notifications-outline' },
    { id: 'other', name: 'Other', icon: 'document-outline' },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = userType === 'tenant'
        ? await documentService.getByTenant(user?.id)
        : await documentService.getByLandlord(user?.id);
      
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      // Mock data
      setDocuments([
        {
          id: 1,
          title: 'Lease Agreement 2024',
          category: 'lease',
          fileName: 'lease_2024.pdf',
          fileSize: 245000,
          uploadedBy: 'Landlord',
          uploadedAt: '2024-01-15',
          description: 'Annual lease agreement',
        },
        {
          id: 2,
          title: 'Rent Receipt - November 2024',
          category: 'receipt',
          fileName: 'receipt_nov_2024.pdf',
          fileSize: 125000,
          uploadedBy: 'System',
          uploadedAt: '2024-11-01',
          description: 'Payment confirmation',
        },
        {
          id: 3,
          title: 'Move-in Inspection Report',
          category: 'inspection',
          fileName: 'inspection_movein.pdf',
          fileSize: 890000,
          uploadedBy: 'Property Manager',
          uploadedAt: '2024-01-01',
          description: 'Initial property condition',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        setFormData({
          ...formData,
          file: {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf',
            size: file.size,
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadDocument = async () => {
    if (!formData.title || !formData.file) {
      Alert.alert('Error', 'Please provide title and select a file');
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('title', formData.title);
      uploadData.append('category', formData.category);
      uploadData.append('description', formData.description);
      uploadData.append('uploadedBy', user?.id);
      uploadData.append('userType', userType);

      const response = await documentService.upload(uploadData);

      if (response.data.success) {
        Alert.alert('Success', 'Document uploaded successfully!');
        setShowUploadModal(false);
        resetForm();
        loadDocuments();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      Alert.alert('Download', `Downloading ${document.fileName}...`);
      // In production, this would trigger actual download
      const response = await documentService.download(document.id);
      // Handle file download based on platform
    } catch (error) {
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const handleDeleteDocument = (document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await documentService.delete(document.id);
              Alert.alert('Success', 'Document deleted');
              loadDocuments();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const handleShareDocument = (document) => {
    Alert.alert('Share Document', 'Share functionality coming soon');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'lease',
      description: '',
      file: null,
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : 'document-outline';
  };

  const getCategoryColor = (category) => {
    const colors = {
      lease: '#3B82F6',
      receipt: '#10B981',
      inspection: '#F59E0B',
      maintenance: '#EF4444',
      notice: '#8B5CF6',
      other: '#64748B',
    };
    return colors[category] || '#64748B';
  };

  const filteredDocuments = documents.filter((doc) => {
    return filterCategory === 'all' || doc.category === filterCategory;
  });

  const getStatsCounts = () => {
    return {
      total: documents.length,
      lease: documents.filter(d => d.category === 'lease').length,
      receipt: documents.filter(d => d.category === 'receipt').length,
      inspection: documents.filter(d => d.category === 'inspection').length,
    };
  };

  const stats = getStatsCounts();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.info} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Documents</Text>
            <Text style={styles.headerSubtitle}>{stats.total} documents</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowUploadModal(true)}>
            <Ionicons name="cloud-upload" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color={colors.info} />
            <Text style={styles.statValue}>{stats.lease}</Text>
            <Text style={styles.statLabel}>Leases</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="receipt" size={24} color={colors.success} />
            <Text style={styles.statValue}>{stats.receipt}</Text>
            <Text style={styles.statLabel}>Receipts</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="clipboard" size={24} color={colors.warning} />
            <Text style={styles.statValue}>{stats.inspection}</Text>
            <Text style={styles.statLabel}>Inspections</Text>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterTab,
                filterCategory === category.id && styles.filterTabActive,
              ]}
              onPress={() => setFilterCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={filterCategory === category.id ? '#fff' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.filterTabText,
                  filterCategory === category.id && styles.filterTabTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Documents List */}
        <View style={styles.documentsList}>
          {filteredDocuments.map((document) => (
            <TouchableOpacity
              key={document.id}
              style={styles.documentCard}
              onPress={() => {
                setSelectedDocument(document);
                setShowDetailsModal(true);
              }}
            >
              <View style={styles.documentHeader}>
                <View
                  style={[
                    styles.documentIcon,
                    { backgroundColor: getCategoryColor(document.category) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(document.category)}
                    size={24}
                    color={getCategoryColor(document.category)}
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle}>{document.title}</Text>
                  <Text style={styles.documentFileName}>{document.fileName}</Text>
                  <View style={styles.documentMeta}>
                    <Text style={styles.documentMetaText}>
                      {formatFileSize(document.fileSize)}
                    </Text>
                    <Text style={styles.documentMetaText}>•</Text>
                    <Text style={styles.documentMetaText}>{document.uploadedAt}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.documentFooter}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(document.category) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryBadgeText,
                      { color: getCategoryColor(document.category) },
                    ]}
                  >
                    {document.category}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDownloadDocument(document)}
                  style={styles.downloadButton}
                >
                  <Ionicons name="download-outline" size={20} color={colors.info} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredDocuments.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No documents found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filterCategory === 'all'
                ? 'Upload your first document'
                : `No ${filterCategory} documents`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Upload Document Modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Document Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lease Agreement 2024"
              placeholderTextColor="#64748B"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Text style={styles.inputLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {categories.filter(c => c.id !== 'all').map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    formData.category === category.id && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.id })}
                >
                  <Ionicons
                    name={category.icon}
                    size={20}
                    color={formData.category === category.id ? '#fff' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.categoryOptionText,
                      formData.category === category.id && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Optional description..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <Text style={styles.inputLabel}>Select File *</Text>
            <TouchableOpacity style={styles.filePickerButton} onPress={handlePickDocument}>
              <Ionicons name="document-attach-outline" size={24} color={colors.info} />
              <Text style={styles.filePickerText}>
                {formData.file ? formData.file.name : 'Choose file...'}
              </Text>
            </TouchableOpacity>
            {formData.file && (
              <Text style={styles.fileSizeText}>
                Size: {formatFileSize(formData.file.size)}
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowUploadModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUploadDocument}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Document Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsSection}>
              <View
                style={[
                  styles.documentIconLarge,
                  { backgroundColor: getCategoryColor(selectedDocument?.category) + '20' },
                ]}
              >
                <Ionicons
                  name={getCategoryIcon(selectedDocument?.category)}
                  size={48}
                  color={getCategoryColor(selectedDocument?.category)}
                />
              </View>

              <Text style={styles.detailTitle}>{selectedDocument?.title}</Text>
              <Text style={styles.detailFileName}>{selectedDocument?.fileName}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{selectedDocument?.category}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>File Size:</Text>
                <Text style={styles.detailValue}>
                  {formatFileSize(selectedDocument?.fileSize || 0)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Uploaded By:</Text>
                <Text style={styles.detailValue}>{selectedDocument?.uploadedBy}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Upload Date:</Text>
                <Text style={styles.detailValue}>{selectedDocument?.uploadedAt}</Text>
              </View>

              {selectedDocument?.description && (
                <>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailDescription}>{selectedDocument.description}</Text>
                </>
              )}
            </View>

            <View style={styles.actionButtonsGrid}>
              <TouchableOpacity
                style={styles.actionButtonLarge}
                onPress={() => handleDownloadDocument(selectedDocument)}
              >
                <Ionicons name="download-outline" size={24} color={colors.info} />
                <Text style={styles.actionButtonLargeText}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButtonLarge}
                onPress={() => handleShareDocument(selectedDocument)}
              >
                <Ionicons name="share-outline" size={24} color={colors.success} />
                <Text style={styles.actionButtonLargeText}>Share</Text>
              </TouchableOpacity>

              {userType === 'landlord' && (
                <TouchableOpacity
                  style={styles.actionButtonLarge}
                  onPress={() => handleDeleteDocument(selectedDocument)}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.danger} />
                  <Text style={styles.actionButtonLargeText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[5], backgroundColor: colors.surface },
  headerTitle: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  headerSubtitle: { fontSize: typography.sm, color: colors.textSecondary, marginTop: spacing[1] },
  addButton: { width: 48, height: 48, borderRadius: borderRadius['3xl'], backgroundColor: colors.darkBlue,
    justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', padding: spacing[5], paddingTop: spacing[4] },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: typography.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing[2], marginBottom: spacing[1] },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  filterContainer: { paddingHorizontal: spacing[5], marginBottom: spacing[4] },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 20, backgroundColor: colors.surface, marginRight: spacing[2] },
  filterTabActive: { backgroundColor: colors.darkBlue,
  },
  filterTabText: { fontSize: typography.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.medium, marginLeft: spacing[1] + 2 },
  filterTabTextActive: { color: '#fff', fontWeight: typography.fontWeight.semibold },
  documentsList: { padding: spacing[5], paddingTop: 0 },
  documentCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[4], marginBottom: spacing[3] },
  documentHeader: { flexDirection: 'row', marginBottom: spacing[3] },
  documentIcon: { width: 48, height: 48, borderRadius: borderRadius['3xl'], justifyContent: 'center', alignItems: 'center', marginRight: spacing[3] },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: typography.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing[1] },
  documentFileName: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing[1] },
  documentMeta: { flexDirection: 'row', alignItems: 'center' },
  documentMetaText: { fontSize: 11, color: colors.textMuted, marginRight: spacing[1] + 2 },
  documentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: '#1E293B' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: spacing[1] + 2, borderRadius: borderRadius.xl },
  categoryBadgeText: { fontSize: 11, fontWeight: typography.fontWeight.semibold, textTransform: 'capitalize' },
  downloadButton: { padding: spacing[2] },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: typography.lg, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginTop: spacing[4] },
  emptyStateSubtext: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing[2] },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing[6], maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[6] },
  modalTitle: { fontSize: typography['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  inputLabel: { fontSize: typography.sm, fontWeight: typography.fontWeight.semibold, color: colors.slate[200], marginBottom: spacing[2], marginTop: spacing[2] },
  input: { backgroundColor: colors.slate[800], borderWidth: 1, borderColor: '#334155', borderRadius: borderRadius.lg, padding: spacing[4], fontSize: typography.base, color: colors.textPrimary, marginBottom: spacing[4] },
  textArea: { height: 80, textAlignVertical: 'top' },
  categorySelector: { marginBottom: spacing[4] },
  categoryOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate[800], borderRadius: borderRadius.lg, paddingHorizontal: spacing[3], paddingVertical: 10, marginRight: spacing[2] },
  categoryOptionSelected: { backgroundColor: colors.darkBlue,
  },
  categoryOptionText: { fontSize: typography.xs, color: colors.textSecondary, marginLeft: spacing[1] + 2 },
  categoryOptionTextSelected: { color: '#fff', fontWeight: typography.fontWeight.semibold },
  filePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate[800], borderWidth: 2, borderColor: '#334155', borderRadius: borderRadius.lg, padding: spacing[4], marginBottom: spacing[2], borderStyle: 'dashed' },
  filePickerText: { fontSize: typography.sm, color: colors.textSecondary, marginLeft: spacing[3], flex: 1 },
  fileSizeText: { fontSize: typography.xs, color: colors.textMuted, marginBottom: spacing[4] },
  modalButtons: { flexDirection: 'row', marginTop: spacing[6] },
  modalButton: { flex: 1, padding: spacing[4], borderRadius: borderRadius.lg, alignItems: 'center' },
  cancelButton: { backgroundColor: colors.slate[800], marginRight: spacing[2] },
  cancelButtonText: { color: colors.slate[200], fontSize: typography.base, fontWeight: typography.fontWeight.semibold },
  saveButton: { backgroundColor: colors.darkBlue,
    marginLeft: spacing[2] },
  saveButtonText: { color: colors.gold,
    fontSize: typography.base, fontWeight: typography.fontWeight.semibold },
  detailsSection: { alignItems: 'center', marginBottom: spacing[6] },
  documentIconLarge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4] },
  detailTitle: { fontSize: typography.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[1], textAlign: 'center' },
  detailFileName: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: spacing[5], textAlign: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  detailLabel: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.fontWeight.medium },
  detailValue: { fontSize: typography.sm, color: colors.textPrimary, fontWeight: typography.fontWeight.medium, textTransform: 'capitalize' },
  detailDescription: { fontSize: typography.sm, color: colors.slate[200], marginTop: spacing[2], lineHeight: 20 },
  actionButtonsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButtonLarge: { width: '48%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.slate[800], borderRadius: borderRadius.lg, padding: spacing[5], marginBottom: spacing[3] },
  actionButtonLargeText: { fontSize: typography.sm, fontWeight: typography.fontWeight.semibold, color: colors.slate[200], marginTop: spacing[2] },
});

export default DocumentsScreen;
