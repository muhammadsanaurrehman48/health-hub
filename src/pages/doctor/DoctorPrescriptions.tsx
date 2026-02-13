import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import PrescriptionTemplate from '@/components/templates/PrescriptionTemplate';
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  Search,
  Eye,
  Printer,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const DoctorPrescriptions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  
  // Dynamic data states
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // New prescription form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');

  // Fetch data
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [rxRes, patientsRes] = await Promise.all([
        api.getPrescriptions().catch(() => ({ success: false, data: [] })),
        api.getPatients().catch(() => ({ success: false, data: [] })),
      ]);

      if (rxRes.success && rxRes.data) {
        const rxList = (Array.isArray(rxRes.data) ? rxRes.data : []).map((rx: any) => ({
          id: rx._id || rx.id,
          rxNo: rx.prescriptionNo || rx.rxNo || `RX-${String(rx._id).slice(-6)}`,
          patientName: rx.patientName || rx.patient || 'Unknown',
          mrNo: rx.mrNo || rx.patient?.mrNo || '',
          date: rx.createdAt ? new Date(rx.createdAt).toISOString().split('T')[0] : (rx.date ? new Date(rx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          diagnosis: rx.diagnosis || 'N/A',
          medicines: rx.medicines?.length || 0,
          status: rx.status || 'pending',
          fullData: rx,
        }));
        setPrescriptions(rxList);
      }

      if (patientsRes.success && patientsRes.data) {
        const patientList = (Array.isArray(patientsRes.data) ? patientsRes.data : []).map((p: any) => ({
          id: p._id || p.id,
          mrNo: p.mrNo || p.patientNo || `MR-${String(p._id).slice(-6)}`,
          name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || 'Unknown',
          forceNo: p.forceNo || '',
          age: p.age || (p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0),
          gender: p.gender || 'Unknown',
          phone: p.phone || 'N/A',
        }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'dispensed':
      case 'completed':
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" /> Dispensed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleCreatePrescription = async () => {
    if (!selectedPatient || !diagnosis || medicines.some(m => !m.name)) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      const patient = patients.find(p => p.mrNo === selectedPatient);
      const prescriptionData = {
        patientId: patient?.id,
        patientName: patient?.name,
        mrNo: selectedPatient,
        diagnosis,
        medicines: medicines.filter(m => m.name),
        notes,
        date: new Date().toISOString(),
        status: 'pending',
      };
      
      await api.createPrescription(prescriptionData);
      toast.success('Prescription created successfully!');
      setIsAddDialogOpen(false);
      setSelectedPatient('');
      setDiagnosis('');
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setNotes('');
      fetchData(true); // Refresh list
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    }
  };

  const handleViewPrescription = async (rx: any) => {
    try {
      // Try to get full prescription data
      if (rx.id) {
        const response = await api.getPrescription(rx.id).catch(() => null);
        if (response?.success && response.data) {
          const fullRx = response.data;
          const patient = patients.find(p => p.mrNo === fullRx.mrNo || p.id === fullRx.patientId);
          setSelectedPrescription({
            prescriptionNo: fullRx.prescriptionNo || fullRx.rxNo || rx.rxNo,
            date: fullRx.date ? new Date(fullRx.date).toISOString().split('T')[0] : rx.date,
            patient: {
              name: fullRx.patient?.name || fullRx.patientName || patient?.name || rx.patientName,
              mrNo: fullRx.patient?.mrNo || fullRx.mrNo || patient?.mrNo || rx.mrNo,
              forceNo: fullRx.patient?.forceNo || patient?.forceNo || '',
              age: fullRx.patient?.age || patient?.age || (fullRx.patient?.dateOfBirth ? Math.floor((Date.now() - new Date(fullRx.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0),
              gender: fullRx.patient?.gender || patient?.gender || 'Unknown',
              phone: fullRx.patient?.phone || patient?.phone || 'N/A',
            },
            doctor: fullRx.doctor || {
              name: 'Doctor',
              specialization: 'General',
              qualification: 'MBBS',
              regNo: 'PMC-00000',
            },
            vitals: fullRx.vitals || {},
            diagnosis: fullRx.diagnosis || rx.diagnosis,
            medicines: fullRx.medicines || [],
            labTests: fullRx.labTests || [],
            radiologyTests: fullRx.radiologyTests || [],
            notes: fullRx.notes || '',
            followUpDate: fullRx.followUpDate || '',
          });
          setIsViewSheetOpen(true);
          return;
        }
      }
      // Fallback to basic data
      setSelectedPrescription({
        prescriptionNo: rx.rxNo,
        date: rx.date,
        patient: { name: rx.patientName, mrNo: rx.mrNo },
        diagnosis: rx.diagnosis,
        medicines: [],
        notes: '',
      });
      setIsViewSheetOpen(true);
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      toast.error('Failed to load prescription details');
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx) =>
    rx.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.mrNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.rxNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout requiredRole="doctor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Prescriptions</h2>
            <p className="text-muted-foreground">View and manage prescriptions you've written</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prescription History</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Rx No, Patient, MR No"
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
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MR No</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No prescriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrescriptions.map((rx) => (
                    <TableRow key={rx.id}>
                      <TableCell className="font-bold text-primary">{rx.rxNo}</TableCell>
                      <TableCell>{rx.date}</TableCell>
                      <TableCell className="font-medium">{rx.patientName}</TableCell>
                      <TableCell>{rx.mrNo}</TableCell>
                      <TableCell>{rx.diagnosis}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rx.medicines} items</Badge>
                      </TableCell>
                    <TableCell>{getStatusBadge(rx.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewPrescription(rx)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Prescription Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prescription</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Patient Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Patient *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Search patient by MR No" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length === 0 ? (
                        <SelectItem value="" disabled>No patients found</SelectItem>
                      ) : (
                        patients.map((p) => (
                          <SelectItem key={p.mrNo || p.id} value={p.mrNo}>
                            {p.name} - {p.mrNo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis *</Label>
                  <Input
                    placeholder="Enter diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
              </div>

              {/* Medicines */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Medicines</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMedicine}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Medicine
                  </Button>
                </div>
                {medicines.map((med, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-xs">Medicine *</Label>
                      <Input
                        placeholder="Name"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dosage</Label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Frequency</Label>
                      <Input
                        placeholder="e.g., 3x daily"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Input
                        placeholder="e.g., 7 days"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Instructions</Label>
                      <Input
                        placeholder="After meals"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMedicine(index)}
                      disabled={medicines.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Special Instructions / Notes</Label>
                <Textarea
                  placeholder="Any special instructions for the patient..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePrescription}>
                Create Prescription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Prescription Sheet */}
        <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Prescription Details</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {selectedPrescription && <PrescriptionTemplate data={selectedPrescription} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
