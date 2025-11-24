import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import receiptService from '../services/receiptService';

const ReceiptButton = ({ transaction, style }) => {
    const [generating, setGenerating] = useState(false);

    const handleGenerateReceipt = async () => {
        try {
            setGenerating(true);

            // Generate PDF
            const result = await receiptService.generateReceipt(transaction);

            if (result.success) {
                // Ask user what to do with the receipt
                Alert.alert(
                    'Receipt Generated',
                    'What would you like to do with your receipt?',
                    [
                        {
                            text: 'Share',
                            onPress: async () => {
                                const shared = await receiptService.shareReceipt(result.filePath);
                                if (!shared) {
                                    Alert.alert('Error', 'Failed to share receipt');
                                }
                            },
                        },
                        {
                            text: 'Download',
                            onPress: async () => {
                                const downloaded = await receiptService.downloadReceipt(
                                    result.filePath,
                                    result.fileName
                                );
                                if (downloaded.success) {
                                    Alert.alert('Success', downloaded.message);
                                } else {
                                    Alert.alert('Error', downloaded.error || 'Failed to download receipt');
                                }
                            },
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to generate receipt');
            }
        } catch (error) {
            console.error('Error handling receipt:', error);
            Alert.alert('Error', 'Failed to generate receipt');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={handleGenerateReceipt}
            disabled={generating}
        >
            {generating ? (
                <>
                    <ActivityIndicator size="small" color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>Generating...</Text>
                </>
            ) : (
                <>
                    <Ionicons name="document-text" size={20} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>Get Receipt</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ReceiptButton;
