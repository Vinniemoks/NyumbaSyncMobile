import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #6366F1',
        paddingBottom: 10,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6366F1',
        marginBottom: 5,
    },
    companyTagline: {
        fontSize: 10,
        color: '#64748B',
    },
    receiptTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#1E293B',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6366F1',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '40%',
        fontSize: 10,
        color: '#64748B',
    },
    value: {
        width: '60%',
        fontSize: 10,
        color: '#1E293B',
        fontWeight: 'medium',
    },
    divider: {
        borderBottom: '1 solid #E2E8F0',
        marginVertical: 15,
    },
    totalSection: {
        backgroundColor: '#F1F5F9',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6366F1',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderTop: '1 solid #E2E8F0',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#94A3B8',
        textAlign: 'center',
    },
    statusBadge: {
        padding: 5,
        borderRadius: 4,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusPaid: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
    },
});

const PaymentReceipt = ({ transaction }) => {
    const {
        transactionId,
        amount,
        currency = 'KES',
        type,
        description,
        status,
        paymentMethod,
        mpesa,
        createdAt,
        property,
        user,
    } = transaction;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount) => {
        return `${currency} ${amount.toLocaleString()}`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>NyumbaSync</Text>
                    <Text style={styles.companyTagline}>Property Management Solution</Text>
                </View>

                {/* Receipt Title */}
                <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>

                {/* Status Badge */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <View style={[
                        styles.statusBadge,
                        status === 'completed' ? styles.statusPaid : styles.statusPending
                    ]}>
                        <Text>{status === 'completed' ? 'PAID' : status.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Transaction Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transaction Details</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Receipt Number:</Text>
                        <Text style={styles.value}>{transactionId}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Transaction Date:</Text>
                        <Text style={styles.value}>{formatDate(createdAt)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Method:</Text>
                        <Text style={styles.value}>{paymentMethod.toUpperCase()}</Text>
                    </View>
                    {mpesa?.receiptNumber && (
                        <View style={styles.row}>
                            <Text style={styles.label}>M-Pesa Receipt:</Text>
                            <Text style={styles.value}>{mpesa.receiptNumber}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.divider} />

                {/* Customer Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>{user?.name || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{user?.email || 'N/A'}</Text>
                    </View>
                    {user?.phone && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.value}>{user.phone}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.divider} />

                {/* Property Details */}
                {property && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Property Information</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Property:</Text>
                                <Text style={styles.value}>{property.name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Address:</Text>
                                <Text style={styles.value}>{property.address}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                    </>
                )}

                {/* Payment Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Type:</Text>
                        <Text style={styles.value}>{type.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                    {description && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Description:</Text>
                            <Text style={styles.value}>{description}</Text>
                        </View>
                    )}
                </View>

                {/* Total Amount */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount Paid:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(amount)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This is a computer-generated receipt and does not require a signature.
                    </Text>
                    <Text style={styles.footerText}>
                        Thank you for your payment. For questions, contact support@nyumbasync.com
                    </Text>
                    <Text style={styles.footerText}>
                        NyumbaSync - Simplifying Property Management
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default PaymentReceipt;
