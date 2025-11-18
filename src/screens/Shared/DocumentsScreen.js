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
      lease: '#6366F1',
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
        <ActivityIndicator size="large" color="#6366F1" />
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
            <Ionicons name="document-text" size={24} color="#6366F1" />
            <Text style={styles.statValue}>{stats.lease}</Text>
            <Text style={styles.statLabel}>Leases</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="receipt" size={24} color="#10B981" />
            <Text style={styles.statValue}>{stats.receipt}</Text>
            <Text style={styles.statLabel}>Receipts</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="clipboard" size={24} color="#F59E0B" />
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
                  <Ionicons name="download-outline" size={20} color="#6366F1" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredDocuments.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#64748B" />
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
                <Ionicons name="close" size={24} color="#94A3B8" />
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
              <Ionicons name="document-attach-outline" size={24} color="#6366F1" />
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
                <Ionicons name="close" size={24} color="#94A3B8" />
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
                <Ionicons name="download-outline" size={24} color="#6366F1" />
                <Text style={styles.actionButtonLargeText}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButtonLarge}
                onPress={() => handleShareDocument(selectedDocument)}
              >
                <Ionicons name="share-outline" size={24} color="#10B981" />
                <Text style={styles.actionButtonLargeText}>Share</Text>
              </TouchableOpacity>

              {userType === 'landlord' && (
                <TouchableOpacity
                  style={styles.actionButtonLarge}
                  onPress={() => handleDeleteDocument(selectedDocument)}
                >
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
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
  container: { flex: 1, backgroundColor: '#020617' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#0F172A' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', padding: 20, paddingTop: 16 },
  statCard: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC', marginTop: 8, marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#94A3B8' },
  filterContainer: { paddingHorizontal: 20, marginBottom: 16 },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0F172A', marginRight: 8 },
  filterTabActive: { backgroundColor: '#6366F1' },
  filterTabText: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginLeft: 6 },
  filterTabTextActive: { color: '#fff', fontWeight: '600' },
  documentsList: { padding: 20, paddingTop: 0 },
  documentCard: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginBottom: 12 },
  documentHeader: { flexDirection: 'row', marginBottom: 12 },
  documentIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginBottom: 4 },
  documentFileName: { fontSize: 13, color: '#94A3B8', marginBottom: 4 },
  documentMeta: { flexDirection: 'row', alignItems: 'center' },
  documentMetaText: { fontSize: 11, color: '#64748B', marginRight: 6 },
  documentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1E293B' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  categoryBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  downloadButton: { padding: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#94A3B8', marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, color: '#64748B', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#E2E8F0', marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 16, fontSize: 16, color: '#F8FAFC', marginBottom: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  categorySelector: { marginBottom: 16 },
  categoryOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginRight: 8 },
  categoryOptionSelected: { backgroundColor: '#6366F1' },
  categoryOptionText: { fontSize: 12, color: '#94A3B8', marginLeft: 6 },
  categoryOptionTextSelected: { color: '#fff', fontWeight: '600' },
  filePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderWidth: 2, borderColor: '#334155', borderRadius: 8, padding: 16, marginBottom: 8, borderStyle: 'dashed' },
  filePickerText: { fontSize: 14, color: '#94A3B8', marginLeft: 12, flex: 1 },
  fileSizeText: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', marginTop: 24 },
  modalButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#1E293B', marginRight: 8 },
  cancelButtonText: { color: '#E2E8F0', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#6366F1', marginLeft: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  detailsSection: { alignItems: 'center', marginBottom: 24 },
  documentIconLarge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  detailTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4, textAlign: 'center' },
  detailFileName: { fontSize: 14, color: '#94A3B8', marginBottom: 20, textAlign: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  detailLabel: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#F8FAFC', fontWeight: '500', textTransform: 'capitalize' },
  detailDescription: { fontSize: 14, color: '#E2E8F0', marginTop: 8, lineHeight: 20 },
  actionButtonsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButtonLarge: { width: '48%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: 8, padding: 20, marginBottom: 12 },
  actionButtonLargeText: { fontSize: 14, fontWeight: '600', color: '#E2E8F0', marginTop: 8 },
});

export default DocumentsScreen;
