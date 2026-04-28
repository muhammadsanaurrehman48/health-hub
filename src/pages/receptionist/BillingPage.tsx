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
  patientType: 'ASF' | 'ASF_FOUNDATION' | 'ASF_FAMILY' | 'ASF_SCHOOL' | 'CIVILIAN';
  forceNo?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  gender?: string;
}

const FOUNDATION_TYPES = ['ASF_FOUNDATION', 'ASF_SCHOOL'] as const;
const LEGACY_FAMILY_TYPES = ['ASF_FAMILY'] as const;

// OPD charges per patient type (must match backend pricing.js)
const OPD_CHARGES: Record<string, number> = {
  ASF: 0,
  ASF_FAMILY: 0,
  ASF_SCHOOL: 30,
  ASF_FOUNDATION: 30,
  CIVILIAN: 100,
};

const isStaffType = (type?: string) => type === 'ASF';
const isFoundationType = (type?: string) => (type ? FOUNDATION_TYPES.includes(type as any) : false);
const isLegacyFamilyType = (type?: string) => (type ? LEGACY_FAMILY_TYPES.includes(type as any) : false);
const formatPatientType = (type?: string) => {
  if (!type) return 'N/A';
  if (isFoundationType(type)) return 'ASF Foundation/School';
  if (isLegacyFamilyType(type)) return 'ASF Staff Family';
  if (type === 'ASF') return 'ASF Staff';
  if (type === 'CIVILIAN') return 'Civilian';
  return type;
};

const resolveInvoiceAmounts = (inv: any) => {
  // subtotal = pre-discount sum of items
  const subtotal = Number(inv?.total ?? 0);
  const rawDiscount = Number(inv?.discount ?? 0);
  // netAmount = what patient actually owes (after discount)
  // Use stored netAmount if available (could be 0 for free patients), otherwise compute
  const netAmount = (inv?.netAmount != null) ? Number(inv.netAmount) : Math.max(subtotal - rawDiscount, 0);
  // Infer discount if backend set discount=0 but netAmount < total (legacy data)
  const discount = rawDiscount > 0 ? rawDiscount : Math.max(subtotal - netAmount, 0);
  const paid = Number(inv?.amountPaid ?? 0);
  const balance = Math.max(netAmount - paid, 0);
  return { subtotal, discount, netAmount, paid, balance };
};

const mapInvoiceToTemplate = (inv: any) => {
  const { subtotal, discount, netAmount, paid, balance } = resolveInvoiceAmounts(inv);
  const createdAt = inv?.createdAt ? new Date(inv.createdAt) : new Date();
  const dueDate = inv?.dueDate ? new Date(inv.dueDate) : new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    invoiceNo: inv?.invoiceNo || 'INV-UNKNOWN',
    date: createdAt.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    status: (inv?.paymentStatus || 'pending') as 'paid' | 'pending' | 'partial',
    patientType: inv?.patientType,
    patient: {
      name: inv?.patientName || inv?.patient?.name || 'N/A',
      mrNo: inv?.patientNo || inv?.patient?.mrNo || '',
      forceNo: inv?.forceNo || inv?.patient?.forceNo || '',
      phone: inv?.patient?.phone || '',
      address: inv?.patient?.address || '',
    },
    items: inv?.items || [],
    subtotal,
    discount,
    tax: 0,
    grandTotal: netAmount,
    amountPaid: paid,
    balance,
    paymentMethod: inv?.paymentMethod || '',
    paymentRef: inv?.transactionId || inv?.paymentReference || '',
    createdBy: 'Receptionist',
  } as const;
};

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
  const [hasAutoAddedFoundationFee, setHasAutoAddedFoundationFee] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [customServiceDept, setCustomServiceDept] = useState('OPD');
  const [quantity, setQuantity] = useState('1');
  const [manualDiscount, setManualDiscount] = useState('');
  const [creatingBill, setCreatingBill] = useState(false);

  // Service catalog (loaded from backend based on patient type)
  const [serviceCatalog, setServiceCatalog] = useState<any>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedCatalogService, setSelectedCatalogService] = useState('');

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
      fetchInvoices();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.getInvoices();
      if (response.success) {
        const normalized = (response.data || []).map((inv: any) => {
          const { subtotal, discount, netAmount, paid, balance } = resolveInvoiceAmounts(inv);
          return {
            ...inv,
            total: subtotal,
            discount,
            netAmount,
            amountPaid: paid,
            balance,
          };
        });
        setInvoices(normalized);
        console.log('📥 Fetched invoices:', normalized.length);
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
    setBillItems([]);
    setHasAutoAddedFoundationFee(false);
    console.log('✅ Patient selected:', patient.firstName, patient.lastName);
    // Load service catalog for patient's type
    loadServiceCatalog(patient.patientType);
  };

  const loadServiceCatalog = async (patientType: string) => {
    setCatalogLoading(true);
    try {
      const response = await api.getServicePricing(patientType);
      if (response.success) {
        setServiceCatalog(response.data);
        console.log('📋 Service catalog loaded for', patientType);
      }
    } catch (err) {
      console.error('Error loading service catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    setPatientSearchQuery('');
    setSearchedPatients([]);
    setBillItems([]);
    setHasAutoAddedFoundationFee(false);
    setManualDiscount('');
    setServiceCatalog(null);
    setSelectedCatalogService('');
  };

  useEffect(() => {
    if (!selectedPatient) return;
    if (billItems.length > 0 || hasAutoAddedFoundationFee) return;

    const opdCharge = OPD_CHARGES[selectedPatient.patientType] ?? 100;
    // Auto-add OPD consultation for all patient types (price varies)
    if (opdCharge > 0) {
      const label = isFoundationType(selectedPatient.patientType)
        ? 'OPD Consultation (ASF Foundation/School)'
        : selectedPatient.patientType === 'CIVILIAN'
          ? 'OPD Consultation (Civilian)'
          : 'OPD Consultation';
      setBillItems([
        {
          id: 'opd-consult',
          name: label,
          department: 'OPD',
          quantity: 1,
          unitPrice: opdCharge,
          total: opdCharge,
        },
      ]);
    }
    setHasAutoAddedFoundationFee(true);
  }, [selectedPatient, billItems.length, hasAutoAddedFoundationFee]);

  useEffect(() => {
    setHasAutoAddedFoundationFee(false);
  }, [selectedPatient?.id]);

  const addItemToBill = () => {
    if (!customServiceName || !customServicePrice) {
      toast.error('Please enter service name and price');
      return;
    }
    const price = parseFloat(customServicePrice);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    const qty = parseInt(quantity) || 1;
    setBillItems([
      ...billItems,
      {
        id: Date.now().toString(),
        name: customServiceName,
        department: customServiceDept,
        quantity: qty,
        unitPrice: price,
        total: price * qty,
      },
    ]);
    setCustomServiceName('');
    setCustomServicePrice('');
    setQuantity('1');
  };

  // Add a service from the catalog dropdown (auto-priced)
  const addCatalogService = () => {
    if (!selectedCatalogService || !serviceCatalog) return;

    // Find the service from catalog
    const allServices = [
      ...(serviceCatalog.services?.opd || []),
      ...(serviceCatalog.services?.laboratory || []),
      ...(serviceCatalog.services?.radiology || []),
      ...(serviceCatalog.services?.pharmacy || []),
    ];
    const svc = allServices.find((s: any) => `${s.department}::${s.name}` === selectedCatalogService);
    if (!svc) return;

    // Check if already added
    const alreadyAdded = billItems.find(item => item.name === svc.name && item.department === svc.department);
    if (alreadyAdded) {
      toast.error(`"${svc.name}" is already in the bill`);
      return;
    }

    const price = svc.price || 0;
    setBillItems([
      ...billItems,
      {
        id: Date.now().toString(),
        name: svc.name,
        department: svc.department,
        quantity: 1,
        unitPrice: price,
        total: price,
      },
    ]);
    setSelectedCatalogService('');
    toast.success(`Added "${svc.name}" — Rs. ${price}`);
  };

  // Get catalog services for the selected department
  const getCatalogServicesForDept = (dept: string): any[] => {
    if (!serviceCatalog?.services) return [];
    const key = dept.toLowerCase() === 'lab' ? 'laboratory' : dept.toLowerCase();
    return serviceCatalog.services[key] || [];
  };

  const removeItemFromBill = (id: string) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  
  // Allow optional manual discount
  const manualDiscountValue = manualDiscount ? parseFloat(manualDiscount) || 0 : 0;
  const discount = Math.min(manualDiscountValue, subtotal);
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
      
      const invoiceData: any = {
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        items: billItems.map(item => ({
          service: item.name,
          name: item.name,
          price: item.unitPrice,
          quantity: item.quantity,
          department: item.department,
        })),
        discount: discount,
        source: 'Manual',
      };

      const response = await api.createInvoice(invoiceData);
      
      if (response.success) {
        console.log('✅ Invoice created:', response.data.invoiceNo);

        toast.success(response.message, {
          description: `Invoice: ${response.data.invoiceNo} | Total: Rs. ${grandTotal.toLocaleString()} | Payment pending`,
        });

        // Refresh invoices
        await fetchInvoices();

        // Reset form
        clearSelectedPatient();
        setBillItems([]);
        setManualDiscount('');
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
    invoiceNo: 'INV-2026-0001',
    date: '2026-02-14',
    dueDate: '2026-03-14',
    status: 'paid' as const,
    patient: {
      name: 'Sample Patient',
      mrNo: 'MR-000001',
      forceNo: '',
      phone: '',
      address: '',
    },
    items: [
      { description: 'OPD Consultation Fee', department: 'OPD', quantity: 1, unitPrice: 100, total: 100 },
    ],
    subtotal: 100,
    discount: 0,
    tax: 0,
    grandTotal: 100,
    amountPaid: 100,
    balance: 0,
    paymentMethod: 'Cash',
    paymentRef: '',
    createdBy: 'Receptionist',
  };

  const handlePrintInvoice = (invoice: any) => {
    const invoiceData = mapInvoiceToTemplate(invoice);
    setSelectedInvoice(invoiceData as typeof sampleInvoice);
    setActiveTab('view');
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoiceForPayment) {
      toast.error('Please select an invoice to process payment');
      return;
    }

    const { balance: invoiceBalance } = resolveInvoiceAmounts(selectedInvoiceForPayment);
    if (invoiceBalance > 0 && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setProcessingPayment(true);
    try {
      const amountReceived = parseFloat(paymentAmount);
      const { netAmount, paid, balance } = resolveInvoiceAmounts(selectedInvoiceForPayment);
      const newPaidTotal = paid + amountReceived;
      const newBalance = Math.max(netAmount - newPaidTotal, 0);
      const change = Math.max(amountReceived - balance, 0);
      const newStatus = newBalance <= 0 ? 'paid' : 'partial';

      console.log('💳 Processing payment for invoice:', selectedInvoiceForPayment.invoiceNo);

      const response = await api.updateInvoice(selectedInvoiceForPayment.id, {
        paymentStatus: newStatus,
        paymentMethod,
        transactionId: paymentRef || `RCPT-${Date.now()}`,
        amountPaid: newPaidTotal,
        balance: newBalance,
        amountReceived,
      });

      if (response.success) {
        console.log('✅ Payment processed:', newStatus);
        const changeMsg = change > 0 ? ` | Return to patient: Rs. ${change.toLocaleString()}` : '';
        toast.success('Payment processed successfully!', {
          description: `Received: Rs. ${amountReceived.toLocaleString()} | Status: ${newStatus}${changeMsg}`,
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
                      <TableHead>Source</TableHead>
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
                            {formatPatientType(inv.patientType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {inv.source || 'Manual'}
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
                          {inv.paymentStatus === 'paid' ? (
                            <span className="text-green-600">Rs. {(inv.netAmount ?? inv.total ?? 0).toLocaleString()}</span>
                          ) : (
                            <div>
                              <span>Rs. {(inv.netAmount ?? inv.total ?? 0).toLocaleString()}</span>
                              {inv.balance > 0 && (
                                <p className="text-xs text-red-500">Due: Rs. {inv.balance.toLocaleString()}</p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={inv.paymentStatus === 'pending' ? 'bg-yellow-600' : inv.paymentStatus === 'paid' ? 'bg-green-600' : 'bg-blue-600'}
                          >
                            {inv.paymentStatus || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const invoiceData = mapInvoiceToTemplate(inv);
                                setSelectedInvoice(invoiceData as typeof sampleInvoice);
                                setActiveTab('view');
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(inv)} title="Print Invoice">
                              <Printer className="w-4 h-4" />
                            </Button>
                            {(inv.paymentStatus === 'pending' || inv.paymentStatus === 'partial') && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedInvoiceForPayment(inv);
                                  setPaymentAmount(resolveInvoiceAmounts(inv).balance.toString());
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
                                    {formatPatientType(patient.patientType)}
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
                            {formatPatientType(selectedPatient.patientType)}
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
                    {/* ── Catalog-based service selector (auto-priced) ── */}
                    {selectedPatient && serviceCatalog && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-sm font-semibold mb-2 block">
                          Quick Add — Services with Auto Pricing ({formatPatientType(selectedPatient.patientType)})
                        </Label>
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <Select value={selectedCatalogService} onValueChange={setSelectedCatalogService}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service..." />
                              </SelectTrigger>
                              <SelectContent>
                                {/* OPD */}
                                {getCatalogServicesForDept('opd').length > 0 && (
                                  <>
                                    <SelectItem value="__opd_header" disabled className="font-bold text-primary">
                                      ── OPD ──
                                    </SelectItem>
                                    {getCatalogServicesForDept('opd').map((s: any) => (
                                      <SelectItem key={`OPD::${s.name}`} value={`OPD::${s.name}`}>
                                        {s.name} — Rs. {s.price}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {/* Laboratory */}
                                {getCatalogServicesForDept('laboratory').length > 0 && (
                                  <>
                                    <SelectItem value="__lab_header" disabled className="font-bold text-primary">
                                      ── Laboratory ──
                                    </SelectItem>
                                    {getCatalogServicesForDept('laboratory').map((s: any) => (
                                      <SelectItem key={`Laboratory::${s.name}`} value={`Laboratory::${s.name}`}>
                                        {s.name} — Rs. {s.price}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {/* Radiology */}
                                {getCatalogServicesForDept('radiology').length > 0 && (
                                  <>
                                    <SelectItem value="__rad_header" disabled className="font-bold text-primary">
                                      ── Radiology ──
                                    </SelectItem>
                                    {getCatalogServicesForDept('radiology').map((s: any) => (
                                      <SelectItem key={`Radiology::${s.name}`} value={`Radiology::${s.name}`}>
                                        {s.name} — Rs. {s.price}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {/* Pharmacy */}
                                {getCatalogServicesForDept('pharmacy').length > 0 && (
                                  <>
                                    <SelectItem value="__pharm_header" disabled className="font-bold text-primary">
                                      ── Pharmacy ──
                                    </SelectItem>
                                    {getCatalogServicesForDept('pharmacy').map((s: any) => (
                                      <SelectItem key={`Pharmacy::${s.name}`} value={`Pharmacy::${s.name}`}>
                                        {s.name} — {serviceCatalog?.medicineFree ? 'Free' : `Rs. ${s.price}`}{s.stock != null ? ` [Stock: ${s.stock}]` : ''}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={addCatalogService} disabled={!selectedCatalogService || selectedCatalogService.startsWith('__')}>
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Prices shown are for {formatPatientType(selectedPatient.patientType)} patients. OPD: Rs. {serviceCatalog.opdCharge}
                          {serviceCatalog?.medicineFree && ' | Medicines: Free'}
                        </p>
                      </div>
                    )}
                    {catalogLoading && (
                      <div className="mb-4 text-center text-muted-foreground">
                        <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                        Loading service catalog...
                      </div>
                    )}

                    {/* ── Manual custom service entry ── */}
                    <div className="mb-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Or Add Custom Service</Label>
                    </div>
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <Label>Service Name</Label>
                        <Input
                          placeholder="Enter service name"
                          value={customServiceName}
                          onChange={(e) => setCustomServiceName(e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Label>Department</Label>
                        <Select value={customServiceDept} onValueChange={setCustomServiceDept}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPD">OPD</SelectItem>
                            <SelectItem value="Laboratory">Laboratory</SelectItem>
                            <SelectItem value="Radiology">Radiology</SelectItem>
                            <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-28">
                        <Label>Price (Rs.)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={customServicePrice}
                          onChange={(e) => setCustomServicePrice(e.target.value)}
                        />
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
                    {/* Patient type info */}
                    {selectedPatient && (
                      <div className="p-3 rounded-lg text-sm border bg-muted/50">
                        <p className="font-semibold mb-1">
                          {formatPatientType(selectedPatient.patientType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          OPD Rate: Rs. {OPD_CHARGES[selectedPatient.patientType] ?? 100}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                    </div>

                    {/* Manual discount field */}
                    {selectedPatient && (
                      <div className="py-2 border-b">
                        <Label className="text-sm text-muted-foreground">Discount (Rs.)</Label>
                        <Input
                          type="number"
                          min="0"
                          max={subtotal}
                          placeholder="Enter discount amount"
                          value={manualDiscount}
                          onChange={(e) => setManualDiscount(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {discount > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-medium text-success">- Rs. {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-medium">Rs. {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 px-3 rounded-lg bg-primary/10">
                      <span className="font-semibold">Grand Total:</span>
                      <span className="font-bold text-lg text-primary">
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
                      setPaymentAmount(invoice ? resolveInvoiceAmounts(invoice).balance.toString() : '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an invoice to process" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoices
                        .filter((inv) => inv.paymentStatus !== 'paid')
                        .map((inv) => (
                          <SelectItem key={inv.invoiceNo} value={inv.invoiceNo}>
                            {inv.invoiceNo} - {inv.patientName || inv.patient?.name || 'N/A'} (Rs.{' '}
                            {resolveInvoiceAmounts(inv).balance.toLocaleString()})
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
                            <p className="font-bold text-lg">Rs. {(selectedInvoiceForPayment.netAmount ?? selectedInvoiceForPayment.total ?? 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-xs text-muted-foreground">Previous Payment</p>
                            <p className="font-bold text-lg">Rs. {(selectedInvoiceForPayment.amountPaid ?? 0).toLocaleString()}</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-xs text-muted-foreground">Amount Due</p>
                            <p className="font-bold text-lg text-red-700">
                              Rs. {((selectedInvoiceForPayment.netAmount ?? selectedInvoiceForPayment.total ?? 0) - (selectedInvoiceForPayment.amountPaid ?? 0)).toLocaleString()}
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
                            const amountDue = (selectedInvoiceForPayment.netAmount ?? selectedInvoiceForPayment.total ?? 0) - (selectedInvoiceForPayment.amountPaid ?? 0);
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
                            {selectedInvoiceForPayment && resolveInvoiceAmounts(selectedInvoiceForPayment).balance <= 0 ? 'Mark as Processed' : 'Collect Payment'}
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
