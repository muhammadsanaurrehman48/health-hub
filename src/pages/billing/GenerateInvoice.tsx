import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import BillingInvoiceTemplate from '@/components/templates/BillingInvoiceTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Search, Receipt, Eye } from 'lucide-react';
import { toast } from 'sonner';

const departments = ['OPD', 'Laboratory', 'Radiology', 'Pharmacy'];

// Invoices are primarily auto-generated from lab/radiology/OPD/pharmacy flows
// This page allows manual invoice creation with custom items
const serviceCharges: Record<string, { service: string; price: number }[]> = {};

const GenerateInvoice: React.FC = () => {
  const [patientMR, setPatientMR] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [items, setItems] = useState<{ service: string; price: number; quantity: number }[]>([]);
  const [isCustomItemDialogOpen, setIsCustomItemDialogOpen] = useState(false);
  const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const handleAddItem = (service: string, price: number) => {
    const existing = items.find(i => i.service === service);
    if (existing) {
      setItems(items.map(i => i.service === service ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { service, price, quantity: 1 }]);
    }
  };

  const handleAddCustomItem = () => {
    if (!customTitle || !customPrice) {
      toast.error('Please enter title and price');
      return;
    }
    const price = parseFloat(customPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    handleAddItem(customTitle, price);
    setIsCustomItemDialogOpen(false);
    setCustomTitle('');
    setCustomPrice('');
    toast.success('Custom item added');
  };

  const handleRemoveItem = (service: string) => {
    setItems(items.filter(i => i.service !== service));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleGenerateInvoice = () => {
    if (!patientMR || !patientName || items.length === 0) {
      toast.error('Please fill patient details and add items');
      return;
    }
    setIsInvoiceSheetOpen(true);
    toast.success('Invoice generated successfully');
  };

  const sampleInvoiceData = {
    invoiceNo: 'INV-2025-00456',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    status: 'pending' as const,
    patient: {
      name: patientName || 'Patient Name',
      mrNo: patientMR || 'MR-XXXXXX',
      forceNo: 'F-12345',
      phone: '0300-1234567',
      address: 'Rawalpindi, Pakistan',
    },
    items: items.map(item => ({
      description: item.service,
      department: selectedDept || 'General',
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity,
    })),
    subtotal,
    discount: 0,
    tax,
    grandTotal: total,
    amountPaid: 0,
    balance: total,
    paymentMethod: 'Cash',
    paymentRef: '',
    createdBy: 'Billing Staff',
  };

  return (
    <DashboardLayout requiredRole="billing">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Generate Invoice</h1>
          <p className="text-muted-foreground">Create new patient billing invoice</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Info & Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>MR No / Force No *</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter MR No"
                        value={patientMR}
                        onChange={(e) => setPatientMR(e.target.value)}
                      />
                      <Button variant="outline" size="icon">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Patient Name *</Label>
                    <Input
                      placeholder="Patient name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Services */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add Services</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setIsCustomItemDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Custom Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDept && serviceCharges[selectedDept] && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {serviceCharges[selectedDept].map((svc) => (
                      <Button
                        key={svc.service}
                        variant="outline"
                        className="justify-between h-auto py-2"
                        onClick={() => handleAddItem(svc.service, svc.price)}
                      >
                        <span className="text-sm">{svc.service}</span>
                        <span className="text-sm text-primary">Rs. {svc.price}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {!selectedDept && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select a department to see predefined services, or add custom items
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoice Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.service} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div>
                          <p className="text-sm font-medium">{item.service}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveItem(item.service)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (5%)</span>
                      <span>Rs. {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="text-primary">Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" onClick={handleGenerateInvoice}>
                      <Receipt className="w-4 h-4 mr-2" />
                      Generate Invoice
                    </Button>
                    {patientMR && patientName && (
                      <Button variant="outline" className="w-full" onClick={() => setIsInvoiceSheetOpen(true)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Invoice
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Add services to preview invoice</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Custom Item Dialog */}
        <Dialog open={isCustomItemDialogOpen} onOpenChange={setIsCustomItemDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Item Title *</Label>
                <Input
                  placeholder="e.g., Consultation, Special Procedure"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (Rs.) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCustomItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Preview Sheet */}
        <Sheet open={isInvoiceSheetOpen} onOpenChange={setIsInvoiceSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Invoice Preview</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <BillingInvoiceTemplate data={sampleInvoiceData} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default GenerateInvoice;
