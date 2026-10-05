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
import { documentService, tenantPortal } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../config/theme';
import Button from '../../components/Button';
import { Rows, Row, Field, Options, Sheet } from '../../components/ui';

const SHORT = { all: 'All', lease: 'Leases', receipt: 'Receipts', inspection: 'Inspections', maintenance: 'Repairs', notice: 'Notices', other: 'Other' };

const DocumentsScreen = ({ userType = 'tenant' }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loadError, setLoadError] = useState(false);
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

  const toDoc = (d) => ({
    id: String(d._id || d.id),
    title: d.name || d.title || d.fileName || 'Document',
    category: d.category || 'other',
    fileName: d.fileName || d.originalName || d.name || '',
    fileSize: Number(d.fileSize) || 0,
    uploadedAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '',
    description: d.description || '',
  });

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = userType === 'tenant'
        ? await tenantPortal.documents()
        : await documentService.getByLandlord(user?.id);
      const raw = Array.isArray(response.data) ? response.data : response.data?.documents || [];
      setDocuments(raw.map(toDoc));
      setLoadError(false);
    } catch (error) {
      setDocuments([]);
      setLoadError(true);
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
      lease: '#15803D',
      receipt: '#16A34A',
      inspection: '#B45309',
      maintenance: '#DC2626',
      notice: '#A16207',
      other: '#56667C',
    };
    return colors[category] || '#56667C';
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
        <ActivityIndicator size="small" color={colors.textMuted} />
      </View>
    );
  }

  const sel = selectedDocument;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[8] }}>
        <View style={styles.top}>
          <Text style={styles.muted}>{stats.total} {stats.total === 1 ? 'file' : 'files'}</Text>
          <TouchableOpacity onPress={() => setShowUploadModal(true)} hitSlop={8}><Text style={styles.link}>Upload</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          {categories.map((c) => (
            <TouchableOpacity key={c.id} onPress={() => setFilterCategory(c.id)} style={[styles.tab, filterCategory === c.id && styles.tabOn]}>
              <Text style={[styles.tabText, filterCategory === c.id && styles.tabTextOn]}>{SHORT[c.id] || c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredDocuments.length > 0 ? (
          <Rows>
            {filteredDocuments.map((d) => (
              <Row
                key={d.id}
                label={d.title}
                note={[d.category, d.fileSize ? formatFileSize(d.fileSize) : null, d.uploadedAt].filter(Boolean).join(' · ')}
                onPress={() => { setSelectedDocument(d); setShowDetailsModal(true); }}
              />
            ))}
          </Rows>
        ) : (
          <Text style={styles.empty}>
            {loadError ? 'Could not load your documents.' : filterCategory === 'all' ? 'No documents yet.' : `No ${filterCategory} documents.`}
          </Text>
        )}
      </ScrollView>

      <Sheet visible={showUploadModal} title="Upload document" onClose={() => { setShowUploadModal(false); resetForm(); }}>
        <Field label="Title" value={formData.title} onChangeText={(text) => setFormData({ ...formData, title: text })} />
        <Options
          label="Category"
          options={categories.filter((c) => c.id !== 'all').map((c) => ({ value: c.id, label: c.name }))}
          value={formData.category}
          onChange={(category) => setFormData({ ...formData, category })}
        />
        <Field label="Description (optional)" multiline value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} />
        <TouchableOpacity style={styles.file} onPress={handlePickDocument}>
          <Text style={styles.fileText} numberOfLines={1}>
            {formData.file ? `${formData.file.name} · ${formatFileSize(formData.file.size || 0)}` : 'Choose a file'}
          </Text>
        </TouchableOpacity>
        <Button title="Upload" size="lg" onPress={handleUploadDocument} loading={uploading} />
      </Sheet>

      <Sheet visible={showDetailsModal} title={sel?.title || 'Document'} onClose={() => setShowDetailsModal(false)}>
        <Rows>
          {!!sel?.fileName && <Row label="File" value={sel.fileName} />}
          <Row label="Category" value={sel?.category} cap />
          {!!sel?.fileSize && <Row label="Size" value={formatFileSize(sel.fileSize)} />}
          {!!sel?.uploadedAt && <Row label="Uploaded" value={sel.uploadedAt} />}
        </Rows>
        {!!sel?.description && <Text style={styles.desc}>{sel.description}</Text>}
        <Button title="Download" size="lg" onPress={() => handleDownloadDocument(sel)} style={{ marginTop: spacing[4] }} />
        {userType === 'landlord' && (
          <TouchableOpacity onPress={() => handleDeleteDocument(sel)} style={styles.del}>
            <Text style={styles.delText}>Delete document</Text>
          </TouchableOpacity>
        )}
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[4] },
  muted: { color: colors.textSecondary, fontSize: typography.sm },
  container: { flex: 1, backgroundColor: colors.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  link: { color: colors.leaf, fontSize: typography.base, fontWeight: '600' },
  tab: { paddingVertical: spacing[3], marginRight: spacing[5], borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: typography.sm, fontWeight: '600' },
  tabTextOn: { color: colors.textPrimary },
  empty: { color: colors.textSecondary, fontSize: typography.sm, paddingVertical: spacing[5] },
  file: { borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 8, padding: spacing[4], marginBottom: spacing[4], backgroundColor: colors.surface },
  fileText: { color: colors.textSecondary, fontSize: typography.sm },
  desc: { color: colors.textSecondary, fontSize: typography.sm, marginTop: spacing[3] },
  del: { alignItems: 'center', paddingVertical: spacing[4] },
  delText: { color: colors.danger, fontSize: typography.sm, fontWeight: '600' },
});

export default DocumentsScreen;
