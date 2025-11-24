import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Platform } from 'react-native';
import { pdf } from '@react-pdf/renderer';
import PaymentReceipt from '../components/PDF/PaymentReceipt';

class ReceiptService {
    /**
     * Generate PDF receipt for a transaction
     * @param {Object} transaction - Transaction data
     * @returns {Promise<Object>} - { success, filePath, error }
     */
    async generateReceipt(transaction) {
        try {
            // Create PDF document
            const doc = <PaymentReceipt transaction={transaction} />;
            const asPdf = pdf(doc);
            const blob = await asPdf.toBlob();

            // Convert blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    resolve(base64data);
                };
                reader.onerror = reject;
            });
            reader.readAsDataURL(blob);
            const base64data = await base64Promise;

            // Save to file system
            const fileName = `receipt_${transaction.transactionId || Date.now()}.pdf`;
            const filePath = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(filePath, base64data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('Receipt generated:', filePath);
            return {
                success: true,
                filePath,
                fileName,
            };
        } catch (error) {
            console.error('Error generating receipt:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Share receipt PDF
     * @param {String} filePath - Path to PDF file
     * @returns {Promise<Boolean>}
     */
    async shareReceipt(filePath) {
        try {
            const canShare = await Sharing.isAvailableAsync();

            if (!canShare) {
                throw new Error('Sharing is not available on this device');
            }

            await Sharing.shareAsync(filePath, {
                mimeType: 'application/pdf',
                dialogTitle: 'Share Receipt',
            });

            return true;
        } catch (error) {
            console.error('Error sharing receipt:', error);
            return false;
        }
    }

    /**
     * Download receipt (save to Downloads on Android)
     * @param {String} filePath - Path to PDF file
     * @param {String} fileName - Name of the file
     * @returns {Promise<Object>}
     */
    async downloadReceipt(filePath, fileName) {
        try {
            // For Android, we can save to Downloads folder
            if (Platform.OS === 'android') {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

                if (!permissions.granted) {
                    return {
                        success: false,
                        error: 'Permission denied',
                    };
                }

                const base64 = await FileSystem.readAsStringAsync(filePath, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    fileName,
                    'application/pdf'
                );

                await FileSystem.writeAsStringAsync(fileUri, base64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                return {
                    success: true,
                    message: 'Receipt saved to Downloads',
                };
            }

            // For iOS, the file is already in the app's document directory
            // We can share it instead
            await this.shareReceipt(filePath);
            return {
                success: true,
                message: 'Receipt saved',
            };
        } catch (error) {
            console.error('Error downloading receipt:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Delete a receipt file
     * @param {String} filePath - Path to PDF file
     * @returns {Promise<Boolean>}
     */
    async deleteReceipt(filePath) {
        try {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            return true;
        } catch (error) {
            console.error('Error deleting receipt:', error);
            return false;
        }
    }

    /**
     * List all receipts
     * @returns {Promise<Array>}
     */
    async listReceipts() {
        try {
            const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            const receipts = files.filter(file => file.startsWith('receipt_') && file.endsWith('.pdf'));

            const receiptInfos = await Promise.all(
                receipts.map(async (file) => {
                    const filePath = `${FileSystem.documentDirectory}${file}`;
                    const info = await FileSystem.getInfoAsync(filePath);
                    return {
                        fileName: file,
                        filePath,
                        size: info.size,
                        modificationTime: info.modificationTime,
                    };
                })
            );

            return receiptInfos.sort((a, b) => b.modificationTime - a.modificationTime);
        } catch (error) {
            console.error('Error listing receipts:', error);
            return [];
        }
    }

    /**
     * Print receipt PDF
     * @param {String} filePath - Path to PDF file
     * @returns {Promise<Object>}
     */
    async printReceipt(filePath) {
        try {
            await Print.printAsync({
                uri: filePath,
            });

            return {
                success: true,
                message: 'Receipt sent to printer',
            };
        } catch (error) {
            console.error('Error printing receipt:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

export default new ReceiptService();
