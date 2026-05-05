import { Document } from '@react-pdf/renderer';
import { PackingSlipPage } from './PackingSlipPDF';

const PackingSlipBatchPDF = ({ orders = [] }) => (
  <Document>
    {orders.map((order) => (
      <PackingSlipPage key={order.id} order={order} />
    ))}
  </Document>
);

export default PackingSlipBatchPDF;
