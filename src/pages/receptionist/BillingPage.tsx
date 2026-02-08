import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Receipt,
  Plus,
  Search,
  Eye,
  Printer,
  CreditCard,
  Trash2,
  Loader2,
} from 'lucide-react';
import BillingInvoiceTemplate from '@/components/templates/BillingInvoiceTemplate';

const serviceItems = [
  { id: '1', name: 'OPD Consultation', department: 'OPD', price: 500 },
  { id: '2', name: 'Blood CBC Test', department: 'Laboratory', price: 1200 },
  { id: '3', name: 'X-Ray Chest', department: 'Radiology', price: 2500 },
  { id: '4', name: 'ECG', department: 'Cardiology', price: 1500 },
  { id: '5', name: 'Ultrasound', department: 'Radiology', price: 3500 },
];

interface BillItem {
  id: string;
  name: string;
  department: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const BillingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedInvoice, setSelectedInvoice] = useState<typeof sampleInvoice | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New bill form
  const [billMrNo, setBillMrNo] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.getInvoices();
        if (response.success) {
          setInvoices(response.data);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const addItemToBill = () => {
    const service = serviceItems.find((s) => s.id === selectedService);
    if (service) {
      const qty = parseInt(quantity) || 1;
      setBillItems([
        ...billItems,
        {
          id: Date.now().toString(),
          name: service.name,
          department: service.department,
          quantity: qty,
          unitPrice: service.price,
          total: service.price * qty,
        },
      ]);
      setSelectedService('');
      setQuantity('1');
    }
  };

  const removeItemFromBill = (id: string) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const discount = 0;
  const tax = 0;
  const grandTotal = subtotal - discount + tax;

  const handleGenerateBill = () => {
    toast.success('Invoice generated successfully!', {
      description: `Invoice No: INV-2025-0457 | Total: Rs. ${grandTotal.toLocaleString()}`,
    });
    setBillMrNo('');
    setBillItems([]);
    setActiveTab('list');
  };

  const sampleInvoice = {
    invoiceNo: 'INV-2025-0456',
    date: '2025-02-01',
    dueDate: '2025-03-01',
    status: 'paid' as const,
    patient: {
      name: 'Muhammad Ali',
      mrNo: 'MR-001234',
      forceNo: 'F-12345',
      phone: '0300-1234567',
      address: 'House 123, Street 45, Rawalpindi',
    },
    items: [
      { description: 'OPD Consultation', department: 'OPD', quantity: 1, unitPrice: 500, total: 500 },
      { description: 'Blood CBC Test', department: 'Laboratory', quantity: 1, unitPrice: 1200, total: 1200 },
      { description: 'X-Ray Chest', department: 'Radiology', quantity: 1, unitPrice: 2500, total: 2500 },
      { description: 'ECG', department: 'Cardiology', quantity: 1, unitPrice: 1500, total: 1500 },
      { description: 'Medicines', department: 'Pharmacy', quantity: 1, unitPrice: 9800, total: 9800 },
    ],
    subtotal: 15500,
    discount: 0,
    tax: 0,
    grandTotal: 15500,
    amountPaid: 15500,
    balance: 0,
    paymentMethod: 'Cash',
    paymentRef: 'RCPT-2025-0456',
    createdBy: 'Receptionist - Ali Hassan',
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-success text-success-foreground',
      pending: 'bg-warning text-warning-foreground',
      partial: 'bg-blue-500 text-white',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Billing</h2>
            <p className="text-muted-foreground">Generate and manage patient invoices</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">
              <Receipt className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Create Bill
            </TabsTrigger>
            {selectedInvoice && (
              <TabsTrigger value="view">
                <Eye className="w-4 h-4 mr-2" />
                View Invoice
              </TabsTrigger>
            )}
          </TabsList>

          {/* Invoices List */}
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Invoices</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-bold text-primary">{inv.invoiceNo}</TableCell>
                        <TableCell className="font-medium">{inv.patientName}</TableCell>
                        <TableCell>{inv.mrNo}</TableCell>
                        <TableCell>{inv.date}</TableCell>
                        <TableCell>Rs. {inv.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(inv.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedInvoice(sampleInvoice);
                                setActiveTab('view');
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="w-4 h-4" />
                            </Button>
                            {inv.status === 'pending' && (
                              <Button variant="ghost" size="icon">
                                <CreditCard className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Bill */}
          <TabsContent value="create">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label>Patient MR No</Label>
                        <Input
                          placeholder="Enter MR No to search patient"
                          value={billMrNo}
                          onChange={(e) => setBillMrNo(e.target.value)}
                        />
                      </div>
                      <Button className="mt-6">Search</Button>
                    </div>
                    {billMrNo && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <p className="font-semibold">Muhammad Ali</p>
                        <p className="text-sm text-muted-foreground">MR No: {billMrNo} | Force No: F-12345</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Add Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <Label>Select Service</Label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - Rs. {item.price} ({item.department})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <Button className="mt-6" onClick={addItemToBill}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No items added yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          billItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.department}</Badge>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>Rs. {item.unitPrice.toLocaleString()}</TableCell>
                              <TableCell className="font-medium">Rs. {item.total.toLocaleString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => removeItemFromBill(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <div>
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Bill Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium text-success">- Rs. {discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-medium">Rs. {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-primary/10 px-3 rounded-lg">
                      <span className="font-semibold">Grand Total:</span>
                      <span className="font-bold text-lg text-primary">Rs. {grandTotal.toLocaleString()}</span>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleGenerateBill}
                      disabled={billItems.length === 0}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Generate Invoice
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* View Invoice */}
          <TabsContent value="view">
            {selectedInvoice && <BillingInvoiceTemplate data={selectedInvoice} />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
