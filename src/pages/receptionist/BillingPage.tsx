import React, { useState, useEffect, useCallback } from 'react';
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
  RotateCw,
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

interface Patient {
  id: string;
  patientNo: string;
  patientType: 'ASF' | 'ASF_FAMILY' | 'CIVILIAN';
  forceNo?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  gender?: string;
}

const BillingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedInvoice, setSelectedInvoice] = useState<typeof sampleInvoice | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Patient search
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // New bill form
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [creatingBill, setCreatingBill] = useState(false);

  // Payment processing
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Auto-refresh invoices
  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing invoices...');
      fetchInvoices();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.getInvoices();
      if (response.success) {
        setInvoices(response.data);
        console.log('📥 Fetched invoices:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await fetchInvoices();
  };

  // Patient search functionality
  const handlePatientSearch = useCallback(async (query: string) => {
    setPatientSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchedPatients([]);
      return;
    }

    setSearchingPatients(true);
    try {
      console.log('🔍 Searching patients for:', query);
      const response = await api.searchPatients(query);
      if (response.success) {
        setSearchedPatients(response.data);
        setShowPatientDropdown(true);
        console.log('✅ Found patients:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error searching patients:', error);
      toast.error('Failed to search patients');
    } finally {
      setSearchingPatients(false);
    }
  }, []);

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearchQuery('');
    setSearchedPatients([]);
    setShowPatientDropdown(false);
    console.log('✅ Patient selected:', patient.firstName, patient.lastName);
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setPatientSearchQuery('');
    setSearchedPatients([]);
    setBillItems([]);
  };

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
  
  // Conditional billing based on patient type
  const isAutoPayment = selectedPatient?.patientType === 'ASF' || selectedPatient?.patientType === 'ASF_FAMILY';
  const discount = isAutoPayment ? subtotal : 0; // Full discount for ASF members
  const tax = 0;
  const grandTotal = Math.max(subtotal - discount + tax, 0);

  const handleGenerateBill = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (billItems.length === 0) {
      toast.error('Please add at least one service');
      return;
    }

    setCreatingBill(true);
    try {
      console.log('📝 Creating invoice for:', selectedPatient.firstName, selectedPatient.lastName);
      
      const invoiceData = {
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        items: billItems.map(item => ({
          service: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
        })),
        discount: discount,
      };

      const response = await api.createInvoice(invoiceData);
      
      if (response.success) {
        console.log('✅ Invoice created:', response.data.invoiceNo);
        toast.success(response.message, {
          description: `Invoice: ${response.data.invoiceNo} | Total: Rs. ${grandTotal.toLocaleString()}`,
        });

        // Refresh invoices
        await fetchInvoices();

        // Reset form
        clearSelectedPatient();
        setBillItems([]);
        setActiveTab('list');
      }
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      toast.error('Failed to create invoice', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setCreatingBill(false);
    }
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

  const handlePrintInvoice = (invoice: any) => {
    // Convert API data to match InvoiceData interface
    const invoiceData = {
      invoiceNo: invoice.invoiceNo,
      date: new Date(invoice.createdAt).toISOString().split('T')[0],
      dueDate: invoice.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      status: invoice.paymentStatus as 'paid' | 'pending' | 'partial',
      patientType: invoice.patientType,
      patient: {
        name: invoice.patientName || 'N/A',
        mrNo: invoice.patientNo || '',
        forceNo: invoice.forceNo || '',
        phone: '',
        address: '',
      },
      items: invoice.items || [],
      subtotal: invoice.total || 0,
      discount: invoice.discount || 0,
      tax: 0,
      grandTotal: invoice.netAmount || invoice.total || 0,
      amountPaid: 0,
      balance: invoice.netAmount || invoice.total || 0,
      paymentMethod: invoice.paymentMethod || '',
      paymentRef: invoice.transactionId || '',
      createdBy: 'Receptionist',
    };
    setSelectedInvoice(invoiceData as typeof sampleInvoice);
    setActiveTab('view');
    // The print button is in the BillingInvoiceTemplate component itself
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoiceForPayment) {
      toast.error('Please select an invoice to process payment');
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setProcessingPayment(true);
    try {
      const amount = parseFloat(paymentAmount);
      const outstandingBalance = (selectedInvoiceForPayment.netAmount || selectedInvoiceForPayment.total || 0);

      // Allow overpayment (change will be returned to patient)
      const effectivePayment = Math.min(amount, outstandingBalance);

      console.log('💳 Processing payment for invoice:', selectedInvoiceForPayment.invoiceNo);
      
      // Determine new payment status
      const newStatus = amount >= outstandingBalance ? 'paid' : 'partial';

      // Update invoice via API
      const response = await api.updateInvoice(selectedInvoiceForPayment.id, {
        paymentStatus: newStatus,
        paymentMethod: paymentMethod,
        transactionId: paymentRef || `RCPT-${Date.now()}`,
      });

      if (response.success) {
        console.log('✅ Payment processed:', newStatus);
        const change = amount - outstandingBalance;
        const changeMsg = change > 0 ? ` | Return to patient: Rs. ${change.toLocaleString()}` : '';
        toast.success('Payment processed successfully!', {
          description: `Received: Rs. ${amount.toLocaleString()} | Status: ${newStatus}${changeMsg}`,
        });

        // Refresh invoices and reset form
        await fetchInvoices();
        setPaymentAmount('');
        setPaymentRef('');
        setPaymentMethod('cash');
        setSelectedInvoiceForPayment(null);
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      toast.error('Failed to process payment', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setProcessingPayment(false);
    }
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
            <TabsTrigger value="payment">
              <CreditCard className="w-4 h-4 mr-2" />
              Process Payment
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
                  <div className="flex gap-4 items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      title="Refresh invoices"
                    >
                      <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
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
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Loading invoices...</p>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mt-2">No invoices found</p>
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      .filter((inv) => {
                        const searchLower = searchQuery.toLowerCase();
                        return (
                          inv.invoiceNo?.toLowerCase().includes(searchLower) ||
                          inv.patientName?.toLowerCase().includes(searchLower) ||
                          inv.patientNo?.toLowerCase().includes(searchLower)
                        );
                      })
                      .map((inv) => (
                      <TableRow key={inv.id || inv.invoiceNo}>
                        <TableCell className="font-bold text-primary">{inv.invoiceNo}</TableCell>
                        <TableCell className="font-medium">{inv.patientName || '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={inv.patientType === 'CIVILIAN' ? 'secondary' : 'default'}
                          >
                            {inv.patientType === 'ASF_FAMILY' ? 'ASF Family' : inv.patientType || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(inv.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rs. {(inv.netAmount || inv.total || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={inv.autoPayment ? 'bg-green-600' : inv.paymentStatus === 'pending' ? 'bg-yellow-600' : inv.paymentStatus === 'paid' ? 'bg-green-600' : 'bg-blue-600'}
                          >
                            {inv.autoPayment ? 'Auto-Paid' : inv.paymentStatus || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // Convert API data to match InvoiceData interface
                                const invoiceData = {
                                  invoiceNo: inv.invoiceNo,
                                  date: new Date(inv.createdAt).toISOString().split('T')[0],
                                  dueDate: inv.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
                                  status: inv.paymentStatus as 'paid' | 'pending' | 'partial',
                                  patientType: inv.patientType,
                                  patient: {
                                    name: inv.patientName || 'N/A',
                                    mrNo: inv.patientNo || '',
                                    forceNo: inv.forceNo || '',
                                    phone: '',
                                    address: '',
                                  },
                                  items: inv.items || [],
                                  subtotal: inv.total || 0,
                                  discount: inv.discount || 0,
                                  tax: 0,
                                  grandTotal: inv.netAmount || inv.total || 0,
                                  amountPaid: 0,
                                  balance: inv.netAmount || inv.total || 0,
                                  paymentMethod: inv.paymentMethod || '',
                                  paymentRef: inv.transactionId || '',
                                  createdBy: 'Receptionist',
                                };
                                setSelectedInvoice(invoiceData as typeof sampleInvoice);
                                setActiveTab('view');
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(inv)} title="Print Invoice">
                              <Printer className="w-4 h-4" />
                            </Button>
                            {(inv.paymentStatus === 'pending' || inv.paymentStatus === 'partial') && !inv.autoPayment && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setActiveTab('payment');
                                }}
                                title="Process Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
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
                  <CardContent className="space-y-4">
                    {!selectedPatient ? (
                      <div className="relative">
                        <Label>Search Patient (Force Number or Name)</Label>
                        <div className="relative mt-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Type force number or patient name..."
                            className="pl-10"
                            value={patientSearchQuery}
                            onChange={(e) => handlePatientSearch(e.target.value)}
                            onFocus={() => patientSearchQuery.length >= 2 && setShowPatientDropdown(true)}
                          />
                        </div>

                        {searchingPatients && (
                          <div className="mt-2 text-center text-muted-foreground">
                            <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                            Searching...
                          </div>
                        )}

                        {showPatientDropdown && searchedPatients.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                            {searchedPatients.map((patient) => (
                              <button
                                key={patient.id}
                                onClick={() => selectPatient(patient)}
                                className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-b-0 transition"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold">
                                      {patient.firstName} {patient.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Patient No: {patient.patientNo} {patient.forceNo ? `| Force No: ${patient.forceNo}` : ''}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="ml-2">
                                    {patient.patientType === 'ASF_FAMILY' ? 'ASF Family' : patient.patientType}
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {showPatientDropdown && patientSearchQuery.length >= 2 && searchedPatients.length === 0 && !searchingPatients && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                            No patients found
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Patient Name</p>
                            <p className="font-bold text-lg">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                          </div>
                          <Badge 
                            variant={selectedPatient.patientType === 'CIVILIAN' ? 'destructive' : 'default'}
                            className="ml-2"
                          >
                            {selectedPatient.patientType === 'ASF_FAMILY' ? 'ASF Family' : selectedPatient.patientType}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Patient No</p>
                            <p className="font-semibold">{selectedPatient.patientNo}</p>
                          </div>
                          {selectedPatient.forceNo && (
                            <div>
                              <p className="text-xs text-muted-foreground">Force No</p>
                              <p className="font-semibold">{selectedPatient.forceNo}</p>
                            </div>
                          )}
                        </div>

                        {(selectedPatient.patientType === 'ASF' || selectedPatient.patientType === 'ASF_FAMILY') && (
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            ✅ ASF/ASF Family member - Services will be provided free of charge
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={clearSelectedPatient}
                        >
                          Change Patient
                        </Button>
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
                    {isAutoPayment && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                        <p className="font-semibold mb-1">✅ Free Services</p>
                        <p>Full amount will be waived for ASF family members</p>
                      </div>
                    )}

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Discount (ASF):</span>
                        <span className="font-medium text-success">- Rs. {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-medium">Rs. {tax.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between py-3 px-3 rounded-lg ${isAutoPayment ? 'bg-green-100' : 'bg-primary/10'}`}>
                      <span className="font-semibold">Grand Total:</span>
                      <span className={`font-bold text-lg ${isAutoPayment ? 'text-green-700' : 'text-primary'}`}>
                        Rs. {grandTotal.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleGenerateBill}
                      disabled={!selectedPatient || billItems.length === 0 || creatingBill}
                    >
                      {creatingBill ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Invoice...
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4 mr-2" />
                          Generate Invoice
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Payment Processing */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Process Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Invoice Selection */}
                <div>
                  <Label>Select Invoice</Label>
                  <Select
                    value={selectedInvoiceForPayment?.invoiceNo || ''}
                    onValueChange={(invoiceNo) => {
                      const invoice = invoices.find((inv) => inv.invoiceNo === invoiceNo);
                      setSelectedInvoiceForPayment(invoice || null);
                      setPaymentAmount('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an invoice to process" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices
                        .filter((inv) => inv.paymentStatus !== 'paid' && !inv.autoPayment)
                        .map((inv) => (
                          <SelectItem key={inv.invoiceNo} value={inv.invoiceNo}>
                            {inv.invoiceNo} - {inv.patient?.name || inv.patientName || 'N/A'} (Rs.{' '}
                            {((inv.grandTotal || 0) - (inv.amountPaid || 0)).toLocaleString()})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoiceForPayment && (
                  <>
                    {/* Invoice Details */}
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Invoice</p>
                          <p className="font-semibold">{selectedInvoiceForPayment.invoiceNo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Patient</p>
                          <p className="font-semibold">{selectedInvoiceForPayment.patientName || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded border">
                            <p className="text-xs text-muted-foreground">Bill Amount</p>
                            <p className="font-bold text-lg">Rs. {(selectedInvoiceForPayment.netAmount || selectedInvoiceForPayment.total || 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-xs text-muted-foreground">Previous Payment</p>
                            <p className="font-bold text-lg">Rs. {(selectedInvoiceForPayment.amountPaid || 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-xs text-muted-foreground">Amount Due</p>
                            <p className="font-bold text-lg text-red-700">
                              Rs. {((selectedInvoiceForPayment.netAmount || selectedInvoiceForPayment.total || 0) - (selectedInvoiceForPayment.amountPaid || 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-4">
                      <div>
                        <Label>Amount Received</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount received from patient"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          className="text-lg font-semibold"
                        />
                      </div>

                      {/* Payment Summary */}
                      {paymentAmount && (
                        <div className="space-y-3">
                          {(() => {
                            const amountDue = (selectedInvoiceForPayment.netAmount || selectedInvoiceForPayment.total || 0) - (selectedInvoiceForPayment.amountPaid || 0);
                            const amountReceived = parseFloat(paymentAmount) || 0;
                            const change = amountReceived - amountDue;
                            const isOverpayment = change > 0;
                            const isExactPayment = Math.abs(change) < 0.01;
                            const isUnderpayment = change < 0;

                            return (
                              <>
                                {isOverpayment && (
                                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <p className="text-sm font-semibold text-blue-900">Amount Received vs Due</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount Due:</span>
                                        <span className="font-semibold">Rs. {amountDue.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount Received:</span>
                                        <span className="font-semibold text-blue-700">Rs. {amountReceived.toLocaleString()}</span>
                                      </div>
                                      <div className="border-t pt-2 flex justify-between bg-green-50 -mx-4 px-4 py-2 rounded">
                                        <span className="font-bold text-green-800">💵 Amount to be Returned:</span>
                                        <span className="font-bold text-lg text-green-700">Rs. {change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {isExactPayment && (
                                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm font-semibold text-green-800">✅ Exact Payment - No Change Required</p>
                                  </div>
                                )}

                                {isUnderpayment && (
                                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount Due:</span>
                                        <span className="font-semibold">Rs. {amountDue.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount Received:</span>
                                        <span className="font-semibold text-orange-700">Rs. {amountReceived.toLocaleString()}</span>
                                      </div>
                                      <div className="border-t pt-2 flex justify-between bg-red-50 -mx-4 px-4 py-2 rounded">
                                        <span className="font-bold text-red-800">⚠️ Still Due:</span>
                                        <span className="font-bold text-lg text-red-700">Rs. {Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <div>
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentMethod !== 'cash' && (
                        <div>
                          <Label>Reference Number</Label>
                          <Input
                            placeholder={`Enter ${paymentMethod === 'check' ? 'check number' : 'transaction ID'}`}
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                          />
                        </div>
                      )}

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleProcessPayment}
                        disabled={!selectedInvoiceForPayment || !paymentAmount || processingPayment}
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Collect Payment
                          </>
                        )}
                      </Button>

                      {selectedInvoiceForPayment &&
                        selectedInvoiceForPayment.amountPaid > 0 &&
                        selectedInvoiceForPayment.balance === 0 && (
                          <Button
                            className="w-full"
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              setSelectedInvoice(selectedInvoiceForPayment);
                              setActiveTab('view');
                              toast.info('Invoice is ready for printing', {
                                description: 'Use the Print button in the invoice view',
                              });
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View & Print Final Bill
                          </Button>
                        )}
                    </div>
                  </>
                )}

                {!selectedInvoiceForPayment && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto opacity-50 mb-2" />
                    <p>Select an invoice above to process payment</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
