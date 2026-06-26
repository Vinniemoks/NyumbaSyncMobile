import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import receiptService from '../services/receiptService';
import { colors, spacing, typography, shadows, borderRadius } from '../../config/theme';

const ReceiptHistoryScreen = ({ navigation }) => {
    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState('all');

    useEffect(() => {
        loadReceipts();
    }, []);

    useEffect(() => {
        filterReceipts();
    }, [receipts, searchQuery, filterYear]);

    const loadReceipts = async () => {
        try {
            const receiptList = await receiptService.listReceipts();
            setReceipts(receiptList);
        } catch (error) {
            console.error('Error loading receipts:', error);
            Alert.alert('Error', 'Failed to load receipts');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterReceipts = () => {
        let filtered = [...receipts];

        // Filter by year
        if (filterYear !== 'all') {
            filtered = filtered.filter(receipt => {
                const receiptDate = new Date(receipt.modificationTime * 1000);
                return receiptDate.getFullYear().toString() === filterYear;
            });
        }

        // Filter by search query (searches in filename and date)
        if (searchQuery) {
            filtered = filtered.filter(receipt => {
                const fileName = receipt.fileName.toLowerCase();
                const date = new Date(receipt.modificationTime * 1000).toLocaleDateString();
                return fileName.includes(searchQuery.toLowerCase()) ||
                    date.includes(searchQuery.toLowerCase());
            });
        }

        setFilteredReceipts(filtered);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadReceipts();
    };

    const handlePrint = async (receipt) => {
        const result = await receiptService.printReceipt(receipt.filePath);
        if (result.success) {
            Alert.alert('Success', 'Receipt sent to printer');
        } else {
            Alert.alert('Error', result.error || 'Failed to print receipt');
        }
    };

    const handleShare = async (receipt) => {
        const shared = await receiptService.shareReceipt(receipt.filePath);
        if (!shared) {
            Alert.alert('Error', 'Failed to share receipt');
        }
    };

    const handleDownload = async (receipt) => {
        const result = await receiptService.downloadReceipt(receipt.filePath, receipt.fileName);
        if (result.success) {
            Alert.alert('Success', result.message);
        } else {
            Alert.alert('Error', result.error || 'Failed to download receipt');
        }
    };

    const handleDelete = async (receipt) => {
        Alert.alert(
            'Delete Receipt',
            'Are you sure you want to delete this receipt?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const deleted = await receiptService.deleteReceipt(receipt.filePath);
                        if (deleted) {
                            setReceipts(receipts.filter(r => r.filePath !== receipt.filePath));
                            Alert.alert('Success', 'Receipt deleted');
                        } else {
                            Alert.alert('Error', 'Failed to delete receipt');
                        }
                    },
                },
            ]
        );
    };

    const showActions = (receipt) => {
        Alert.alert(
            'Receipt Actions',
            'What would you like to do?',
            [
                {
                    text: 'Print',
                    onPress: () => handlePrint(receipt),
                },
                {
                    text: 'Share',
                    onPress: () => handleShare(receipt),
                },
                {
                    text: 'Download',
                    onPress: () => handleDownload(receipt),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(receipt),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const getAvailableYears = () => {
        const years = receipts.map(receipt => {
            const date = new Date(receipt.modificationTime * 1000);
            return date.getFullYear();
        });
        return ['all', ...Array.from(new Set(years)).sort((a, b) => b - a)];
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderReceipt = ({ item }) => (
        <TouchableOpacity
            style={styles.receiptCard}
            onPress={() => showActions(item)}
            activeOpacity={0.7}
        >
            <View style={styles.receiptIcon}>
                <Ionicons name="document-text" size={32} color={colors.info} />
            </View>
            <View style={styles.receiptInfo}>
                <Text style={styles.receiptName} numberOfLines={1}>
                    {item.fileName.replace('receipt_', '').replace('.pdf', '')}
                </Text>
                <Text style={styles.receiptDate}>{formatDate(item.modificationTime)}</Text>
                <Text style={styles.receiptSize}>{formatFileSize(item.size)}</Text>
            </View>
            <View style={styles.receiptActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePrint(item)}
                >
                    <Ionicons name="print" size={20} color={colors.info} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(item)}
                >
                    <Ionicons name="share-social" size={20} color={colors.success} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.info} />
                <Text style={styles.loadingText}>Loading receipts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Receipt History</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or date..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Year Filter */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Year:</Text>
                <View style={styles.yearButtons}>
                    {getAvailableYears().map(year => (
                        <TouchableOpacity
                            key={year}
                            style={[
                                styles.yearButton,
                                filterYear === year.toString() && styles.yearButtonActive,
                            ]}
                            onPress={() => setFilterYear(year.toString())}
                        >
                            <Text
                                style={[
                                    styles.yearButtonText,
                                    filterYear === year.toString() && styles.yearButtonTextActive,
                                ]}
                            >
                                {year === 'all' ? 'All' : year}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Receipts List */}
            <FlatList
                data={filteredReceipts}
                renderItem={renderReceipt}
                keyExtractor={(item) => item.filePath}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.info}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No receipts found</Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery || filterYear !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Receipts will appear here after payments'}
                        </Text>
                    </View>
                }
            />

            {/* Stats Footer */}
            {filteredReceipts.length > 0 && (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Showing {filteredReceipts.length} of {receipts.length} receipt(s)
                    </Text>
                </View>
            )}
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
    loadingText: {
        marginTop: spacing[3],
        fontSize: typography.base,
        color: colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing[4],
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        margin: spacing[4],
        padding: spacing[3],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    searchIcon: {
        marginRight: spacing[2],
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.textPrimary,
    },
    filterContainer: {
        paddingHorizontal: spacing[4],
        marginBottom: spacing[4],
    },
    filterLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing[2],
    },
    yearButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    yearButton: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    yearButtonActive: {
        backgroundColor: colors.darkBlue,
    borderColor: colors.info,
    },
    yearButtonText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    yearButtonTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: spacing[4],
        paddingTop: 0,
    },
    receiptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing[4],
        marginBottom: spacing[3],
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    receiptIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[3],
    },
    receiptInfo: {
        flex: 1,
    },
    receiptName: {
        fontSize: 15,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing[1],
    },
    receiptDate: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    receiptSize: {
        fontSize: 11,
        color: colors.textMuted,
    },
    receiptActions: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: typography.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary,
        marginTop: spacing[4],
    },
    emptySubtext: {
        fontSize: typography.sm,
        color: colors.textMuted,
        marginTop: spacing[2],
        textAlign: 'center',
    },
    footer: {
        padding: spacing[4],
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        backgroundColor: colors.surface,
    },
    footerText: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default ReceiptHistoryScreen;
