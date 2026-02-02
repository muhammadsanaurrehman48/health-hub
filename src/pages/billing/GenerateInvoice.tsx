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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Search, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const departments = ['OPD', 'IPD', 'Pharmacy', 'Laboratory', 'Radiology', 'Emergency', 'Surgery'];

const serviceCharges: Record<string, { service: string; price: number }[]> = {
  OPD: [
    { service: 'Consultation Fee', price: 1500 },
    { service: 'Follow-up Visit', price: 800 },
    { service: 'Emergency Consultation', price: 2500 },
  ],
  Laboratory: [
    { service: 'Complete Blood Count', price: 800 },
    { service: 'Lipid Profile', price: 1500 },
    { service: 'Liver Function Test', price: 1200 },
    { service: 'Thyroid Panel', price: 2000 },
  ],
  Radiology: [
    { service: 'X-Ray', price: 1000 },
    { service: 'CT Scan', price: 8000 },
    { service: 'MRI', price: 15000 },
    { service: 'Ultrasound', price: 2500 },
  ],
};

const GenerateInvoice: React.FC = () => {
  const [patientMR, setPatientMR] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [items, setItems] = useState<{ service: string; price: number; quantity: number }[]>([]);

  const handleAddItem = (service: string, price: number) => {
    const existing = items.find(i => i.service === service);
    if (existing) {
      setItems(items.map(i => i.service === service ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { service, price, quantity: 1 }]);
    }
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
    toast.success('Invoice generated successfully');
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
                <CardTitle>Add Services</CardTitle>
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

                  <Button className="w-full" onClick={handleGenerateInvoice}>
                    Generate Invoice
                  </Button>
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
      </div>
    </DashboardLayout>
  );
};

export default GenerateInvoice;
