import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent } from '@/components/ui/card';
import { Search, CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const pendingPayments = [
  { id: 'INV-2025-0456', patient: 'Muhammad Ali', mrNo: 'MR-001234', amount: 15500, paid: 0, date: '2025-02-01', department: 'OPD' },
  { id: 'INV-2025-0455', patient: 'Fatima Begum', mrNo: 'MR-001235', amount: 8200, paid: 4000, date: '2025-02-01', department: 'Pharmacy' },
  { id: 'INV-2025-0454', patient: 'Ahmed Khan', mrNo: 'MR-001236', amount: 25000, paid: 0, date: '2025-02-01', department: 'IPD' },
  { id: 'INV-2025-0453', patient: 'Sara Hassan', mrNo: 'MR-001237', amount: 45000, paid: 20000, date: '2025-01-31', department: 'Surgery' },
  { id: 'INV-2025-0452', patient: 'Usman Ali', mrNo: 'MR-001238', amount: 3200, paid: 0, date: '2025-01-31', department: 'Laboratory' },
];

const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof pendingPayments[0] | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const filteredPayments = pendingPayments.filter(payment =>
    payment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.mrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount - p.paid), 0);
  const todayCollections = 125000;

  const handlePayment = (invoice: typeof pendingPayments[0]) => {
    setSelectedInvoice(invoice);
    setPaymentAmount((invoice.amount - invoice.paid).toString());
    setIsPaymentDialogOpen(true);
  };

  const handleProcessPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    toast.success(`Payment of Rs. ${parseFloat(paymentAmount).toLocaleString()} received for ${selectedInvoice?.id}`);
    setIsPaymentDialogOpen(false);
  };

  return (
    <DashboardLayout requiredRole="billing">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Process and manage patient payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs. {(totalPending/1000).toFixed(0)}K</p>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs. {(todayCollections/1000).toFixed(0)}K</p>
                  <p className="text-sm text-muted-foreground">Today's Collections</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingPayments.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Invoice No, MR No, or Patient name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Payments Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>MR No</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-primary">{payment.id}</TableCell>
                  <TableCell>{payment.patient}</TableCell>
                  <TableCell>{payment.mrNo}</TableCell>
                  <TableCell>{payment.department}</TableCell>
                  <TableCell>Rs. {payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">Rs. {payment.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-orange-600 font-medium">
                    Rs. {(payment.amount - payment.paid).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handlePayment(payment)}>
                      Receive Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
              <DialogDescription>
                {selectedInvoice?.id} - {selectedInvoice?.patient}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold">Rs. {selectedInvoice?.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="text-green-600">Rs. {selectedInvoice?.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-muted-foreground">Balance:</span>
                <span className="text-orange-600 font-bold">
                  Rs. {((selectedInvoice?.amount || 0) - (selectedInvoice?.paid || 0)).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleProcessPayment}>Process Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
