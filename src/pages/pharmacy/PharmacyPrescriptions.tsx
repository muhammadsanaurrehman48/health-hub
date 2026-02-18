import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PrescriptionTemplate from '@/components/templates/PrescriptionTemplate';
import { toast } from 'sonner';
import {
  Search,
  Pill,
  CheckCircle,
  Clock,
  Printer,
  Package,
  Eye,
  Loader2,
  AlertTriangle,
  Minus,
  Plus,
} from 'lucide-react';

const PharmacyPrescriptions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispense dialog state
  const [isDispenseDialogOpen, setIsDispenseDialogOpen] = useState(false);
  const [dispenseRx, setDispenseRx] = useState<any>(null);
  const [dispenseItems, setDispenseItems] = useState<{ name: string; dosage: string; frequency: string; duration: string; quantity: number; availableStock: number; price: number }[]>([]);
  const [dispensing, setDispensing] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rxResponse, invResponse] = await Promise.all([
          api.getPharmacyPrescriptions(),
          api.getPharmacyInventory(),
        ]);
        if (rxResponse.success) {
          setPrescriptions(rxResponse.data);
        }
        if (invResponse.success) {
          setInventory(invResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'dispensed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Dispensed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Open dispense dialog
  const openDispenseDialog = (rx: any) => {
    const medicines = rx.medicines || [];
    const items = medicines.map((med: any) => {
      // Find matching inventory item (case-insensitive)
      const invItem = inventory.find(
        (inv: any) => inv.name?.toLowerCase() === med.name?.toLowerCase()
      );
      return {
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
        quantity: 1,
        availableStock: invItem?.quantity ?? 0,
        price: invItem?.price ?? 0,
      };
    });
    setDispenseRx(rx);
    setDispenseItems(items);
    setIsDispenseDialogOpen(true);
  };

  // Update quantity for a specific medicine
  const updateDispenseQty = (index: number, newQty: number) => {
    setDispenseItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(0, Math.min(newQty, item.availableStock || 999)) } : item
    ));
  };

  // Calculate dispense total
  const dispenseTotal = dispenseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Confirm dispense
  const handleConfirmDispense = async () => {
    if (!dispenseRx) return;
    setDispensing(true);
    try {
      const response = await api.dispensePrescription(dispenseRx.id, {
        dispensedItems: dispenseItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
        })),
      });
      if (response.success) {
        // Remove dispensed prescription from the list (it's now completed)
        setPrescriptions(prev => prev.filter(p => p.id !== dispenseRx.id));
        // Update local inventory
        setInventory(prev => prev.map(inv => {
          const dispensed = dispenseItems.find(d => d.name?.toLowerCase() === inv.name?.toLowerCase());
          if (dispensed) {
            return { ...inv, quantity: Math.max(0, inv.quantity - dispensed.quantity) };
          }
          return inv;
        }));
        toast.success(`Prescription ${dispenseRx.rxNo} dispensed!`, {
          description: `Invoice sent to reception. Total: Rs. ${dispenseTotal.toLocaleString()}`,
        });
        setIsDispenseDialogOpen(false);
        setDispenseRx(null);
        setDispenseItems([]);
      } else {
        toast.error(response.message || 'Failed to dispense prescription');
      }
    } catch (error: any) {
      console.error('Error dispensing:', error);
      toast.error(error.message || 'Failed to dispense prescription');
    } finally {
      setDispensing(false);
    }
  };

  const handleViewPrescription = (rx: typeof prescriptions[0]) => {
    // Transform API data to PrescriptionTemplate format
    const templateData = {
      prescriptionNo: rx.rxNo || '',
      date: rx.date || new Date(rx.createdAt).toLocaleDateString(),
      patient: {
        name: rx.patientName || rx.patient || 'Unknown',
        patientNo: rx.mrNo || '',
        forceNo: rx.forceNo || '',
        age: rx.age || 0,
        gender: rx.gender || '',
        phone: rx.phone || '',
      },
      doctor: {
        name: rx.doctor || 'Unknown',
        specialization: rx.department || '',
        qualification: '',
        regNo: '',
      },
      diagnosis: rx.diagnosis || '',
      medicines: rx.medicines || [],
      labTests: rx.labTests || [],
      radiologyTests: rx.radiologyTests || [],
      notes: rx.notes || '',
      followUpDate: rx.followUpDate || '',
    };
    setSelectedRx(templateData);
    setIsViewSheetOpen(true);
  };

  const filteredPrescriptions = prescriptions.filter((rx) =>
    rx.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.mrNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.rxNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout requiredRole="pharmacy">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="pharmacy">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Prescriptions</h2>
            <p className="text-muted-foreground">Process and dispense patient prescriptions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{prescriptions.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{prescriptions.filter(r => r.status === 'dispensed').length}</p>
                  <p className="text-sm text-muted-foreground">Dispensed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{prescriptions.reduce((sum, r) => sum + (Array.isArray(r.medicines) ? r.medicines.length : 0), 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Medicines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prescription Queue</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Rx No, MR No, Name"
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
                  <TableHead>Rx No</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MR No</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-bold text-primary">{rx.rxNo}</TableCell>
                    <TableCell className="font-medium">{rx.patientName}</TableCell>
                    <TableCell>{rx.mrNo}</TableCell>
                    <TableCell>{rx.doctor}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {Array.isArray(rx.medicines) ? rx.medicines.length : 0} medicine{Array.isArray(rx.medicines) && rx.medicines.length !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{rx.date}</TableCell>
                    <TableCell>{getStatusBadge(rx.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {rx.status === 'pending' && (
                          <Button size="sm" onClick={() => openDispenseDialog(rx)}>
                            <Package className="w-4 h-4 mr-1" />
                            Dispense
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleViewPrescription(rx)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Prescription Sheet */}
        <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Prescription Details</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {selectedRx && <PrescriptionTemplate data={selectedRx} />}
            </div>
          </SheetContent>
        </Sheet>

        {/* Dispense Dialog */}
        <Dialog open={isDispenseDialogOpen} onOpenChange={(open) => {
          if (!dispensing) {
            setIsDispenseDialogOpen(open);
            if (!open) {
              setDispenseRx(null);
              setDispenseItems([]);
            }
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Dispense Prescription — {dispenseRx?.rxNo}
              </DialogTitle>
              <DialogDescription>
                Patient: <strong>{dispenseRx?.patientName}</strong> | Doctor: {dispenseRx?.doctor}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Medicine items table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Dosage / Frequency</TableHead>
                    <TableHead className="text-center">In Stock</TableHead>
                    <TableHead className="text-center">Unit Price</TableHead>
                    <TableHead className="text-center">Qty to Dispense</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispenseItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.duration && (
                            <p className="text-xs text-muted-foreground">Duration: {item.duration}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.dosage && <span>{item.dosage}</span>}
                        {item.frequency && <span className="block text-muted-foreground">{item.frequency}</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.availableStock <= 0 ? 'destructive' : item.availableStock <= 10 ? 'secondary' : 'outline'}>
                          {item.availableStock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        Rs. {(item.price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateDispenseQty(index, item.quantity - 1)}
                            disabled={item.quantity <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={item.availableStock || 999}
                            value={item.quantity}
                            onChange={(e) => updateDispenseQty(index, parseInt(e.target.value) || 0)}
                            className="w-16 h-7 text-center text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateDispenseQty(index, item.quantity + 1)}
                            disabled={item.quantity >= (item.availableStock || 999)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        {item.quantity > 0 && item.availableStock > 0 && item.quantity > item.availableStock && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1 justify-center">
                            <AlertTriangle className="w-3 h-3" /> Exceeds stock
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {((item.price || 0) * item.quantity).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Total Section */}
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {dispenseItems.filter(i => i.quantity > 0).length} of {dispenseItems.length} medicines being dispensed
                  </p>
                  {dispenseItems.some(i => i.availableStock <= 0) && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Some medicines not found in inventory
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Invoice Total</p>
                  <p className="text-2xl font-bold">Rs. {dispenseTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDispenseDialogOpen(false)}
                disabled={dispensing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDispense}
                disabled={dispensing || dispenseItems.every(i => i.quantity <= 0)}
              >
                {dispensing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Dispensing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Dispense
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyPrescriptions;
