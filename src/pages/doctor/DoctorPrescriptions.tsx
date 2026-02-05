import React, { useState } from 'react';
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
import {
  Search,
  Eye,
  Printer,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';

const mockPrescriptions = [
  { id: '1', rxNo: 'RX-456789', patientName: 'Muhammad Ali', mrNo: 'MR-001234', date: '2025-02-01', diagnosis: 'Hypertension', medicines: 3, status: 'completed' },
  { id: '2', rxNo: 'RX-456788', patientName: 'Fatima Begum', mrNo: 'MR-001235', date: '2025-02-01', diagnosis: 'Flu', medicines: 4, status: 'pending' },
  { id: '3', rxNo: 'RX-456787', patientName: 'Ahmed Khan', mrNo: 'MR-001236', date: '2025-01-31', diagnosis: 'Back pain', medicines: 2, status: 'completed' },
  { id: '4', rxNo: 'RX-456786', patientName: 'Sara Bibi', mrNo: 'MR-001237', date: '2025-01-31', diagnosis: 'Diabetes Type 2', medicines: 5, status: 'completed' },
];

const mockPatients = [
  { mrNo: 'MR-001234', name: 'Muhammad Ali', forceNo: 'F-12345', age: 45, gender: 'Male', phone: '0300-1234567' },
  { mrNo: 'MR-001235', name: 'Fatima Begum', forceNo: 'F-12346', age: 32, gender: 'Female', phone: '0301-2345678' },
  { mrNo: 'MR-001236', name: 'Ahmed Khan', forceNo: 'F-12347', age: 28, gender: 'Male', phone: '0302-3456789' },
];

const samplePrescriptionData = {
  prescriptionNo: 'RX-456789',
  date: '2025-02-01',
  patient: {
    name: 'Muhammad Ali',
    mrNo: 'MR-001234',
    forceNo: 'F-12345',
    age: 45,
    gender: 'Male',
    phone: '0300-1234567',
  },
  doctor: {
    name: 'Dr. Ahmad Khan',
    specialization: 'Cardiology',
    qualification: 'MBBS, FCPS',
    regNo: 'PMC-12345',
  },
  vitals: {
    bloodPressure: '130/85',
    pulse: '78 bpm',
    temperature: '98.6°F',
    weight: '75 kg',
  },
  diagnosis: 'Essential Hypertension',
  medicines: [
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning' },
    { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily at night', duration: '30 days', instructions: 'Take after dinner' },
    { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take after breakfast' },
  ],
  labTests: ['Complete Blood Count', 'Lipid Profile'],
  radiologyTests: [],
  notes: 'Low salt diet, regular exercise recommended. Monitor BP daily.',
  followUpDate: '2025-03-01',
};

const DoctorPrescriptions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  
  // New prescription form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const handleCreatePrescription = () => {
    if (!selectedPatient || !diagnosis || medicines.some(m => !m.name)) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success('Prescription created successfully!');
    setIsAddDialogOpen(false);
    setSelectedPatient('');
    setDiagnosis('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setNotes('');
  };

  const handleViewPrescription = (rx: any) => {
    setSelectedPrescription(rx);
    setIsViewSheetOpen(true);
  };

  const filteredPrescriptions = mockPrescriptions.filter((rx) =>
    rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.mrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.rxNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Prescriptions</h2>
            <p className="text-muted-foreground">View and manage prescriptions you've written</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
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
                {filteredPrescriptions.map((rx) => (
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
                ))}
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
                      {mockPatients.map((p) => (
                        <SelectItem key={p.mrNo} value={p.mrNo}>
                          {p.name} - {p.mrNo}
                        </SelectItem>
                      ))}
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
              <PrescriptionTemplate data={samplePrescriptionData} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
