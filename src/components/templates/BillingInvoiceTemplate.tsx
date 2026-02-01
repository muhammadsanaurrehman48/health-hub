import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, CheckCircle } from 'lucide-react';
import Logo from '@/assets/logo.png';

interface InvoiceItem {
  description: string;
  department: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNo: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'partial';
  patient: {
    name: string;
    mrNo: string;
    forceNo: string;
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
  paymentMethod: string;
  paymentRef: string;
  createdBy: string;
}

interface BillingInvoiceTemplateProps {
  data: InvoiceData;
}

const BillingInvoiceTemplate: React.FC<BillingInvoiceTemplateProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'partial':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto print:shadow-none print:border-none">
        <CardContent className="p-8" ref={printRef}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img src={Logo} alt="Smart Hospital" className="w-16 h-16 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Smart Hospital</h1>
                <p className="text-sm text-muted-foreground">Health Management System</p>
                <p className="text-xs text-muted-foreground mt-1">
                  123 Medical Center, Rawalpindi | Tel: 051-1234567
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-foreground">INVOICE</h2>
              <p className="text-primary font-bold text-lg">{data.invoiceNo}</p>
              <Badge className={getStatusColor(data.status)}>
                {data.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Invoice Details & Patient Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">BILL TO</h3>
              <div className="bg-muted/30 p-4 rounded-lg space-y-1">
                <p className="font-semibold text-lg">{data.patient.name}</p>
                <p className="text-sm">MR No: <span className="font-medium">{data.patient.mrNo}</span></p>
                <p className="text-sm">Force No: <span className="font-medium">{data.patient.forceNo}</span></p>
                <p className="text-sm">Phone: {data.patient.phone}</p>
                <p className="text-sm">{data.patient.address}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">INVOICE DETAILS</h3>
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Invoice Date:</span>
                  <span className="font-medium">{data.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{data.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{data.paymentMethod}</span>
                </div>
                {data.paymentRef && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reference:</span>
                    <span className="font-medium">{data.paymentRef}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold rounded-tl-lg">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Department</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Qty</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-medium">{item.description}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{item.department}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">Rs. {item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium">Rs. {item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">Rs. {data.subtotal.toLocaleString()}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between py-2 text-success">
                  <span>Discount:</span>
                  <span className="font-medium">- Rs. {data.discount.toLocaleString()}</span>
                </div>
              )}
              {data.tax > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">Rs. {data.tax.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between py-2 text-lg">
                <span className="font-semibold">Grand Total:</span>
                <span className="font-bold text-primary">Rs. {data.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 bg-success/10 px-3 rounded-lg">
                <span className="text-success font-medium">Amount Paid:</span>
                <span className="font-bold text-success">Rs. {data.amountPaid.toLocaleString()}</span>
              </div>
              {data.balance > 0 && (
                <div className="flex justify-between py-2 bg-warning/10 px-3 rounded-lg">
                  <span className="text-warning font-medium">Balance Due:</span>
                  <span className="font-bold text-warning">Rs. {data.balance.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status Banner */}
          {data.status === 'paid' && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center justify-center gap-2 mb-6">
              <CheckCircle className="w-6 h-6 text-success" />
              <span className="text-success font-semibold text-lg">PAYMENT RECEIVED - THANK YOU</span>
            </div>
          )}

          <Separator className="my-4" />

          {/* Footer */}
          <div className="flex justify-between items-end mt-6">
            <div className="text-xs text-muted-foreground">
              <p>This is a computer-generated invoice.</p>
              <p>Created by: {data.createdBy}</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-t border-foreground pt-2">
                <p className="font-semibold">Authorized Signature</p>
                <p className="text-sm text-muted-foreground">Billing Department</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Terms & Conditions:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Payment is due within 30 days of invoice date.</li>
              <li>• Please include invoice number on payment.</li>
              <li>• For queries, contact billing department at 051-1234567.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingInvoiceTemplate;
