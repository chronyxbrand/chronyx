import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

export const packingSlipStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
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
  colItem: { width: '60%', padding: 8, borderRightWidth: 1, borderRightColor: '#D4D4D4' },
  colSku: { width: '25%', padding: 8, borderRightWidth: 1, borderRightColor: '#D4D4D4', textAlign: 'center' },
  colQty: { width: '15%', padding: 8, textAlign: 'center' },
  itemName: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 8,
    color: '#666666',
  },
  checklist: {
    marginTop: 12,
    flexDirection: 'column',
    gap: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checklistBox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  checklistText: {
    fontSize: 9,
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
  },
});

function getPackingSlipData(order) {
  const safeOrder = order || {};
  const items = safeOrder.items || [];
  const dateStr = safeOrder.created_at
    ? new Date(safeOrder.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const shortId = safeOrder.id ? safeOrder.id.slice(0, 8).toUpperCase() : 'XXXX';
  const displayId = `CRX-${new Date().getFullYear()}-${shortId}`;
  const address = safeOrder.shipping_address || {};
  const totalQty = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalWeight = (totalQty * 1.1).toFixed(1);

  return { safeOrder, items, dateStr, displayId, address, totalQty, totalWeight };
}

export function PackingSlipPage({ order }) {
  const { safeOrder, items, dateStr, displayId, address, totalQty, totalWeight } = getPackingSlipData(order);

  return (
    <Page size="A4" style={packingSlipStyles.page}>
      <View style={packingSlipStyles.headerRow}>
        <View>
          <Text style={packingSlipStyles.brandName}>PACKING SLIP</Text>
          <Text style={packingSlipStyles.subtitle}>CHRONYX - Handcrafted Wooden Timepieces</Text>
        </View>
        <View>
          <Text style={packingSlipStyles.orderTitle}>Order #{displayId}</Text>
          <Text style={packingSlipStyles.orderMeta}>{dateStr}</Text>
          <Text style={packingSlipStyles.orderMeta}>Courier: Pending - Tracking: Pending</Text>
        </View>
      </View>

      <View style={packingSlipStyles.addressRow}>
        <View style={packingSlipStyles.addressBlock}>
          <Text style={packingSlipStyles.sectionTitle}>SHIP FROM</Text>
          <Text style={packingSlipStyles.boldText}>CHRONYX</Text>
          <Text style={packingSlipStyles.textLine}>kottekattil (h), elambulassery (po)</Text>
          <Text style={packingSlipStyles.textLine}>elambulassery, Kerala - 678595</Text>
          <Text style={packingSlipStyles.textLine}>India</Text>
        </View>
        <View style={packingSlipStyles.addressBlock}>
          <Text style={packingSlipStyles.sectionTitle}>SHIP TO</Text>
          <Text style={packingSlipStyles.boldText}>{safeOrder.customer_name || 'Customer'}</Text>
          <Text style={packingSlipStyles.textLine}>{address.address || 'Address not provided'}</Text>
          {address.city ? (
            <Text style={packingSlipStyles.textLine}>
              {address.city} - {address.pincode}
            </Text>
          ) : null}
          {address.phone ? <Text style={packingSlipStyles.textLine}>Phone: {address.phone}</Text> : null}
        </View>
      </View>

      <View style={packingSlipStyles.table}>
        <View style={packingSlipStyles.tableHeaderRow}>
          <Text style={[packingSlipStyles.tableHeaderCell, packingSlipStyles.colItem]}>ITEM</Text>
          <Text style={[packingSlipStyles.tableHeaderCell, packingSlipStyles.colSku]}>SKU</Text>
          <Text style={[packingSlipStyles.tableHeaderCell, packingSlipStyles.colQty]}>QTY</Text>
        </View>

        {items.map((item, index) => {
          const isWalnut = item.name?.toLowerCase().includes('walnut');
          const sku = `CRX-${isWalnut ? 'WN' : 'TK'}-00${index + 1}`;
          const estWeight = isWalnut ? '1.2 kg' : '1.0 kg';

          return (
            <View key={`${item.name || 'item'}-${index}`} style={packingSlipStyles.tableRow}>
              <View style={packingSlipStyles.colItem}>
                <Text style={packingSlipStyles.itemName}>{item.name}</Text>
              </View>
              <View style={[packingSlipStyles.colSku, { justifyContent: 'center' }]}>
                <Text>{sku}</Text>
              </View>
              <View style={[packingSlipStyles.colQty, { justifyContent: 'center' }]}>
                <Text>{item.quantity}</Text>
              </View>
            </View>
          );
        })}

        <View style={[packingSlipStyles.tableRow, packingSlipStyles.totalRow, { borderBottomWidth: 0 }]}>
          <View style={[packingSlipStyles.colItem, { paddingVertical: 12 }]}>
            <Text style={packingSlipStyles.itemName}>Total items</Text>
          </View>
          <View style={[packingSlipStyles.colSku, { paddingVertical: 12 }]} />
          <View style={[packingSlipStyles.colQty, { paddingVertical: 12, justifyContent: 'center' }]}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{totalQty}</Text>
          </View>
        </View>
      </View>

      <View style={packingSlipStyles.notesBox}>
        <View style={packingSlipStyles.notesText}>
          <Text style={packingSlipStyles.sectionTitle}>PACKING NOTES</Text>
          <Text>
            Fragile handcrafted item. Wrap individually in bubble wrap. Store upright at all times. Avoid stacking or applying pressure. Keep away from moisture and direct sunlight during transit.
          </Text>
          <View style={packingSlipStyles.checklist}>
            <View style={packingSlipStyles.checklistItem}>
              <View style={packingSlipStyles.checklistBox} />
              <Text style={packingSlipStyles.checklistText}>Verify item before sealing</Text>
            </View>
            <View style={packingSlipStyles.checklistItem}>
              <View style={packingSlipStyles.checklistBox} />
              <Text style={packingSlipStyles.checklistText}>Ensure proper cushioning</Text>
            </View>
            <View style={packingSlipStyles.checklistItem}>
              <View style={packingSlipStyles.checklistBox} />
              <Text style={packingSlipStyles.checklistText}>Seal package securely</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Image 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${displayId}`} 
            style={{ width: 40, height: 40, marginBottom: 4 }} 
          />
          <Text style={{ fontSize: 7, color: '#666666', letterSpacing: 1 }}>SCAN TO VERIFY</Text>
        </View>
      </View>

      <View style={packingSlipStyles.footer}>
        <View>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>CHRONYX</Text>
          <Text style={packingSlipStyles.footerText}>Time, carved from wood.</Text>
        </View>
        <View>
          <Text style={[packingSlipStyles.footerText, { textAlign: 'right', marginBottom: 4 }]}>chronyxbrand@gmail.com | +91 9562122618</Text>
          <Text style={[packingSlipStyles.footerText, { textAlign: 'right' }]}>https://chronyx.in | @chronyx.ck</Text>
        </View>
      </View>
    </Page>
  );
}

const PackingSlipPDF = ({ order }) => (
  <Document>
    <PackingSlipPage order={order} />
  </Document>
);

export default PackingSlipPDF;
