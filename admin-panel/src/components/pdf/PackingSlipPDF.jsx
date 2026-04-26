import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000', // Pure black
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: '#000000',
    paddingBottom: 20,
  },
  brandName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: '#333333',
  },
  orderTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  orderMeta: {
    fontSize: 9,
    textAlign: 'right',
    color: '#333333',
    lineHeight: 1.4,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressBlock: {
    width: '45%',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    padding: 12,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 4,
  },
  textLine: {
    marginBottom: 4,
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#D4D4D4',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
    backgroundColor: '#F5F5F5',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  colItem: { width: '50%', padding: 8, borderRightWidth: 1, borderRightColor: '#D4D4D4' },
  colQty: { width: '15%', padding: 8, borderRightWidth: 1, borderRightColor: '#D4D4D4', textAlign: 'center' },
  colWeight: { width: '20%', padding: 8, borderRightWidth: 1, borderRightColor: '#D4D4D4', textAlign: 'center' },
  colCheck: { width: '15%', padding: 8, textAlign: 'center', alignItems: 'center', justifyContent: 'center' },
  itemName: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 8,
    color: '#666666',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
  },
  notesBox: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'dashed',
    padding: 16,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  notesText: {
    width: '70%',
    lineHeight: 1.5,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopStyle: 'dashed',
    borderTopColor: '#000000',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
  }
});

const PackingSlipPDF = ({ order }) => {
  const safeOrder = order || {};
  const items = safeOrder.items || [];
  const dateStr = safeOrder.created_at ? new Date(safeOrder.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  
  const shortId = safeOrder.id ? safeOrder.id.slice(0, 8).toUpperCase() : 'XXXX';
  const displayId = `KRX-2025-${shortId}`;
  
  const address = safeOrder.shipping_address || {};

  // Estimates
  const totalQty = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalWeight = (totalQty * 1.1).toFixed(1); // Avg 1.1kg per clock

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandName}>PACKING SLIP</Text>
            <Text style={styles.subtitle}>Chronyx · Handcrafted Wooden Timepieces</Text>
          </View>
          <View>
            <Text style={styles.orderTitle}>Order #{displayId}</Text>
            <Text style={styles.orderMeta}>{dateStr}</Text>
            <Text style={styles.orderMeta}>Courier: DTDC · TRK: PENDING</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressRow}>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionTitle}>SHIP FROM</Text>
            <Text style={styles.boldText}>Chronyx</Text>
            <Text style={styles.textLine}>Kanayannur, Kerala</Text>
            <Text style={styles.textLine}>India — 682301</Text>
            <Text style={styles.textLine}>+91 99999 00000</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionTitle}>SHIP TO</Text>
            <Text style={styles.boldText}>{safeOrder.customer_name || 'Customer'}</Text>
            <Text style={styles.textLine}>{address.address || 'Address not provided'}</Text>
            {address.city ? <Text style={styles.textLine}>{address.city} — {address.pincode}</Text> : null}
            {address.phone && <Text style={styles.textLine}>{address.phone}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colItem]}>ITEM</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>QTY</Text>
            <Text style={[styles.tableHeaderCell, styles.colWeight]}>WEIGHT</Text>
            <Text style={[styles.tableHeaderCell, styles.colCheck]}>CHECK</Text>
          </View>

          {items.map((item, index) => {
            const isWalnut = item.name?.toLowerCase().includes('walnut');
            const sku = `CRX-${isWalnut ? 'WN' : 'TK'}-00${index + 1}`;
            const estWeight = isWalnut ? '1.2 kg' : '1.0 kg';

            return (
              <View key={index} style={styles.tableRow}>
                <View style={styles.colItem}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>SKU: {sku}</Text>
                </View>
                <View style={[styles.colQty, { justifyContent: 'center' }]}>
                  <Text>{item.quantity}</Text>
                </View>
                <View style={[styles.colWeight, { justifyContent: 'center' }]}>
                  <Text>~{estWeight}</Text>
                </View>
                <View style={styles.colCheck}>
                  <View style={styles.checkbox} />
                </View>
              </View>
            );
          })}

          <View style={[styles.tableRow, styles.totalRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.colItem, { paddingVertical: 12 }]}>
              <Text style={styles.itemName}>Total items</Text>
            </View>
            <View style={[styles.colQty, { paddingVertical: 12, justifyContent: 'center' }]}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{totalQty}</Text>
            </View>
            <View style={[styles.colWeight, { paddingVertical: 12, justifyContent: 'center' }]}>
              <Text>~{totalWeight} kg</Text>
            </View>
            <View style={styles.colCheck} />
          </View>
        </View>

        {/* Packing Notes */}
        <View style={styles.notesBox}>
          <View style={styles.notesText}>
            <Text style={styles.sectionTitle}>PACKING NOTES</Text>
            <Text>Fragile — wooden clock. Wrap in bubble wrap. Keep upright. Handle with care. Do not stack heavy items on top.</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            {/* Fake QR code placeholder box for visual similarity */}
            <View style={{ width: 40, height: 40, flexWrap: 'wrap', flexDirection: 'row', gap: 2, marginBottom: 4 }}>
              {[...Array(4)].map((_, i) => <View key={i} style={{ width: 18, height: 18, backgroundColor: '#000' }} />)}
            </View>
            <Text style={{ fontSize: 7, color: '#666', letterSpacing: 1 }}>SCAN TO VERIFY</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>CHRONYX</Text>
            <Text style={styles.footerText}>Time, carved from wood.</Text>
          </View>
          <View>
            <Text style={[styles.footerText, { textAlign: 'right', marginBottom: 4 }]}>chronyxbrand@gmail.com</Text>
            <Text style={[styles.footerText, { textAlign: 'right' }]}>chronyx.in · @chronyx</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default PackingSlipPDF;
