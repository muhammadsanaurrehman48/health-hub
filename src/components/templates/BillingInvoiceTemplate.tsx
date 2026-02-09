import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, CheckCircle } from 'lucide-react';

interface InvoiceItem {
  description?: string;
  name?: string;
  department?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  amount?: number;
}

interface InvoiceData {
  invoiceNo: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'partial' | 'auto-paid';
  patientType?: 'ASF' | 'ASF_FAMILY' | 'CIVILIAN';
  patient: {
    name: string;
    patientNo?: string;
    mrNo?: string;
    forceNo?: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
  paymentMethod?: string;
  paymentRef?: string;
  createdBy: string;
}

interface BillingInvoiceTemplateProps {
  data: InvoiceData;
}

const BillingInvoiceTemplate: React.FC<BillingInvoiceTemplateProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleThermalPrint = () => {
    const printWindow = window.open('', '', 'width=400,height=700');
    if (!printWindow) {
      alert('Please disable your popup blocker to print invoices');
      return;
    }

    // Build items HTML
    let itemsHTML = '';
    (data.items || []).forEach(item => {
      const desc = item.description || item.name || 'Service';
      const dept = item.department || '';
      const qty = item.quantity || 1;
      const total = item.total || item.amount || item.unitPrice || 0;
      itemsHTML += '<div class="table-row">';
      itemsHTML += '<div class="item-desc"><strong>' + desc + '</strong>';
      itemsHTML += '<div class="item-dept">' + dept + '</div></div>';
      itemsHTML += '<div class="item-qty">' + qty + '</div>';
      itemsHTML += '<div class="item-amount">Rs. ' + total.toLocaleString() + '</div>';
      itemsHTML += '</div>';
    });

    // Build optional rows
    let dueDateHTML = '';
    if (data.dueDate) {
      dueDateHTML = '<div class="info-row"><span style="font-weight: bold;">Due:</span><span>' + data.dueDate + '</span></div>';
    }

    let discountHTML = '';
    if (data.discount > 0) {
      discountHTML = '<div class="totals-row"><span>Discount:</span><span>- Rs. ' + data.discount.toLocaleString() + '</span></div>';
    }

    let taxHTML = '';
    if (data.tax > 0) {
      taxHTML = '<div class="totals-row"><span>Tax:</span><span>Rs. ' + data.tax.toLocaleString() + '</span></div>';
    }

    let paidHTML = '';
    if (data.amountPaid > 0) {
      paidHTML = '<div class="totals-row"><span>PAID:</span><span>Rs. ' + data.amountPaid.toLocaleString() + '</span></div>';
    }

    let balanceHTML = '';
    if (data.balance > 0) {
      balanceHTML = '<div class="totals-row" style="font-weight: bold; color: #ff6b00;"><span>BALANCE DUE:</span><span>Rs. ' + data.balance.toLocaleString() + '</span></div>';
    }

    let paymentStatusHTML = '';
    if (data.status === 'paid' || data.status === 'auto-paid') {
      paymentStatusHTML = '<div class="payment-status paid">✓ PAYMENT RECEIVED';
      if (data.paymentMethod) {
        paymentStatusHTML += '<div style="font-size: 8px;">' + data.paymentMethod + '</div>';
      }
      if (data.paymentRef) {
        paymentStatusHTML += '<div style="font-size: 7px;">Ref: ' + data.paymentRef + '</div>';
      }
      paymentStatusHTML += '</div>';
    }

    let patientInfoHTML = '';
    if (data.patient.forceNo) {
      patientInfoHTML += 'Force No: ' + data.patient.forceNo;
    }
    if (data.patient.mrNo) {
      if (patientInfoHTML) patientInfoHTML += ' | ';
      patientInfoHTML += 'MR: ' + data.patient.mrNo;
    }

    let patientTypeHTML = '';
    if (data.patientType) {
      patientTypeHTML = 'Type: ' + data.patientType;
    }

    const statusClass = (data.status === 'paid' || data.status === 'auto-paid') ? 'paid' : 'pending';
    const statusText = data.status === 'auto-paid' ? 'AUTO-PAID (GOVT)' : data.status.toUpperCase();

    const invoiceHTML = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="UTF-8">',
      '<title>Invoice ' + data.invoiceNo + '</title>',
      '<style>',
      '* { margin: 0; padding: 0; box-sizing: border-box; }',
      '@media print { @page { size: 80mm auto; margin: 0; } body { width: 80mm; margin: 0; padding: 0; } }',
      'body { font-family: "Courier New", monospace; font-size: 11px; line-height: 1.3; width: 80mm; margin: 0 auto; padding: 0; background: white; color: #000; }',
      '.invoice-wrapper { width: 80mm; padding: 2mm; text-align: center; }',
      '.header { margin-bottom: 2mm; border-bottom: 1px solid #000; padding-bottom: 1.5mm; }',
      '.header h1 { font-size: 12px; font-weight: bold; margin: 0 0 1px 0; letter-spacing: 0.5px; }',
      '.header p { font-size: 8px; margin: 0.5px 0; }',
      '.invoice-no { margin: 1.5mm 0; font-weight: bold; }',
      '.invoice-no .number { font-family: monospace; font-size: 12px; letter-spacing: 1px; margin: 1px 0; }',
      '.status { font-size: 9px; font-weight: bold; margin: 0.5mm 0; }',
      '.status.paid { color: #008000; }',
      '.status.pending { color: #ff6b00; }',
      '.separator { border-top: 1px solid #000; margin: 1mm 0; }',
      '.section-title { font-weight: bold; font-size: 9px; text-align: left; margin: 1mm 0 0.8mm 0; letter-spacing: 0.5px; }',
      '.info-block { text-align: left; font-size: 9px; margin-bottom: 1mm; }',
      '.info-row { display: flex; justify-content: space-between; margin: 0.5px 0; }',
      '.patient-details { text-align: left; font-size: 9px; border: 1px solid #000; padding: 1mm; margin-bottom: 1mm; }',
      '.patient-name { font-weight: bold; font-size: 10px; margin-bottom: 0.5px; }',
      '.patient-info { font-size: 8px; margin: 0.3px 0; }',
      '.table-header { border-bottom: 1px solid #000; padding-bottom: 0.5mm; font-weight: bold; display: grid; grid-template-columns: 2fr 0.7fr 1fr; gap: 1mm; margin-bottom: 0.8mm; font-size: 8px; }',
      '.table-row { display: grid; grid-template-columns: 2fr 0.7fr 1fr; gap: 1mm; margin: 0.6mm 0; padding-bottom: 0.5mm; border-bottom: 1px dotted #ccc; font-size: 8px; }',
      '.item-desc { text-align: left; }',
      '.item-dept { font-size: 7px; color: #666; margin-top: 0.2mm; }',
      '.item-qty { text-align: center; }',
      '.item-amount { text-align: right; font-weight: bold; }',
      '.totals { margin: 1mm 0; font-size: 9px; }',
      '.totals-row { display: flex; justify-content: space-between; margin: 0.5mm 0; padding: 0.3mm 0; }',
      '.totals-row.grand { font-weight: bold; font-size: 10px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 0.8mm 0; margin: 1mm 0; }',
      '.payment-status { text-align: center; margin: 1mm 0; font-weight: bold; font-size: 10px; }',
      '.payment-status.paid { color: #008000; }',
      '.footer { text-align: center; font-size: 8px; margin-top: 1.5mm; border-top: 1px solid #000; padding-top: 1mm; }',
      '.footer p { margin: 0.5mm 0; }',
      '</style>',
      '</head>',
      '<body>',
      '<div class="invoice-wrapper">',
      '<div class="header">',
      '<h1>SMART HOSPITAL</h1>',
      '<p>Healthcare Management System</p>',
      '<p>Medical Center, Rawalpindi | Tel: 051-1234567</p>',
      '</div>',
      '<div class="invoice-no">',
      '<div>BILL / INVOICE</div>',
      '<div class="number">' + data.invoiceNo + '</div>',
      '<div class="status ' + statusClass + '">' + statusText + '</div>',
      '</div>',
      '<div class="separator"></div>',
      '<div class="info-block">',
      '<div class="info-row"><span style="font-weight: bold;">Date:</span><span>' + data.date + '</span></div>',
      dueDateHTML,
      '</div>',
      '<div class="separator"></div>',
      '<p class="section-title">PATIENT DETAILS</p>',
      '<div class="patient-details">',
      '<div class="patient-name">' + data.patient.name + '</div>',
      '<div class="patient-info">' + patientInfoHTML + '</div>',
      '<div class="patient-info">' + patientTypeHTML + '</div>',
      '<div class="patient-info">Ph: ' + data.patient.phone + '</div>',
      '</div>',
      '<div class="separator"></div>',
      '<p class="section-title">SERVICES</p>',
      '<div class="table-header">',
      '<div>Description</div>',
      '<div style="text-align: center;">Qty</div>',
      '<div style="text-align: right;">Amount</div>',
      '</div>',
      itemsHTML,
      '<div class="separator"></div>',
      '<div class="totals">',
      '<div class="totals-row"><span>Subtotal:</span><span>Rs. ' + data.subtotal.toLocaleString() + '</span></div>',
      discountHTML,
      taxHTML,
      '<div class="totals-row grand"><span>TOTAL:</span><span>Rs. ' + data.grandTotal.toLocaleString() + '</span></div>',
      paidHTML,
      balanceHTML,
      '</div>',
      paymentStatusHTML,
      '<div class="footer">',
      '<p style="font-weight: bold;">Thank You!</p>',
      '<p>For your visit to Smart Hospital</p>',
      '<p style="margin: 0.8mm 0 0.3mm 0; font-size: 7px;">' + new Date().toLocaleString() + '</p>',
      '<p style="font-size: 7px;">By: ' + data.createdBy + '</p>',
      '</div>',
      '</div>',
      '</body>',
      '</html>'
    ].join('\n');

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'auto-paid':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'partial':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'auto-paid') return 'AUTO-PAID (Government)';
    return status.toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button onClick={handleThermalPrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice (Thermal)
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8" ref={printRef}>
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-primary">SMART HOSPITAL</h1>
            <p className="text-xs text-muted-foreground">Healthcare Management System</p>
            <p className="text-xs text-muted-foreground">Medical Center, Rawalpindi</p>
            <p className="text-xs text-muted-foreground">Tel: 051-1234567</p>
          </div>

          <Separator className="my-3" />

          <div className="text-center mb-4">
            <p className="text-sm font-bold">BILL / INVOICE</p>
            <p className="text-xs font-mono">{data.invoiceNo}</p>
            <Badge className={getStatusColor(data.status) + ' text-xs mt-2'}>
              {getStatusText(data.status)}
            </Badge>
          </div>

          <Separator className="my-3" />

          <div className="text-xs space-y-1 mb-4">
            <div className="flex justify-between">
              <span className="font-semibold">Date:</span>
              <span>{data.date}</span>
            </div>
            {data.dueDate && (
              <div className="flex justify-between">
                <span className="font-semibold">Due:</span>
                <span>{data.dueDate}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="mb-4">
            <p className="text-xs font-bold mb-2">PATIENT DETAILS</p>
            <div className="text-xs space-y-1 bg-muted/30 p-3 rounded">
              <p className="font-semibold">{data.patient.name}</p>
              {data.patient.forceNo && (
                <p>Force No: <span className="font-mono">{data.patient.forceNo}</span></p>
              )}
              {data.patient.mrNo && (
                <p>MR No: <span className="font-mono">{data.patient.mrNo}</span></p>
              )}
              {data.patientType && (
                <p>Type: <span className="font-semibold">{data.patientType}</span></p>
              )}
              <p>Ph: {data.patient.phone}</p>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="mb-4">
            <p className="text-xs font-bold mb-2">SERVICES</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between font-semibold border-b pb-1">
                <span className="flex-1">Description</span>
                <span className="w-12 text-right">Qty</span>
                <span className="w-16 text-right">Amount</span>
              </div>
              {(data.items || []).map((item, index) => (
                <div key={index} className="space-y-0">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.description || item.name || 'Service'}</p>
                      <p className="text-xs text-muted-foreground">{item.department || ''}</p>
                    </div>
                    <span className="w-12 text-right">{item.quantity || 1}</span>
                    <span className="w-16 text-right font-semibold">Rs. {(item.total || item.amount || item.unitPrice || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-3" />

          <div className="space-y-1 text-xs mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {data.subtotal.toLocaleString()}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount:</span>
                <span>- Rs. {data.discount.toLocaleString()}</span>
              </div>
            )}
            {data.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>Rs. {data.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm py-1 border-t border-double">
              <span>Grand Total:</span>
              <span className="text-primary">Rs. {data.grandTotal.toLocaleString()}</span>
            </div>
            {data.amountPaid > 0 && (
              <div className="flex justify-between bg-success/10 px-2 py-1 rounded text-success font-semibold">
                <span>Amount Paid:</span>
                <span>Rs. {data.amountPaid.toLocaleString()}</span>
              </div>
            )}
            {data.balance > 0 && (
              <div className="flex justify-between bg-warning/10 px-2 py-1 rounded text-warning font-semibold">
                <span>Balance Due:</span>
                <span>Rs. {data.balance.toLocaleString()}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {(data.status === 'paid' || data.status === 'auto-paid') && (
            <div className="text-center bg-success/10 border border-success rounded p-2 mb-4">
              <p className="text-xs font-semibold text-success flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {data.status === 'auto-paid' ? 'AUTO-PAID - GOVT HOSPITAL' : 'PAYMENT RECEIVED'}
              </p>
            </div>
          )}

          {data.paymentMethod && (
            <div className="text-xs text-center text-muted-foreground mb-4">
              <p>Payment Method: {data.paymentMethod}</p>
              {data.paymentRef && <p>Ref: {data.paymentRef}</p>}
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground space-y-1 pt-2">
            <p className="font-semibold">Thank You</p>
            <p>For your visit to Smart Hospital</p>
            <p className="text-xs">Generated: {new Date().toLocaleString()}</p>
            <p className="text-xs">By: {data.createdBy}</p>
            <p className="text-xs mt-2 border-t pt-2">
              Keep this receipt for your records
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingInvoiceTemplate;
