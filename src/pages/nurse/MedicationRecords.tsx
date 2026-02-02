import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Search, Plus, Pill, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const patients = [
  { id: '1', mrNo: 'MR-001234', name: 'Muhammad Ali', ward: 'Ward A', bed: 'A-12', admissionDate: '2025-01-28' },
  { id: '2', mrNo: 'MR-001235', name: 'Fatima Begum', ward: 'Ward B', bed: 'B-05', admissionDate: '2025-01-30' },
  { id: '3', mrNo: 'MR-001236', name: 'Ahmed Khan', ward: 'ICU', bed: 'ICU-02', admissionDate: '2025-01-31' },
  { id: '4', mrNo: 'MR-001237', name: 'Sara Hassan', ward: 'Ward A', bed: 'A-08', admissionDate: '2025-02-01' },
];

const medicationSchedule = [
  { time: '08:00', medicine: 'Paracetamol 500mg', dose: '1 tablet', status: 'given' },
  { time: '12:00', medicine: 'Amoxicillin 500mg', dose: '1 capsule', status: 'given' },
  { time: '14:00', medicine: 'Omeprazole 20mg', dose: '1 capsule', status: 'pending' },
  { time: '20:00', medicine: 'Paracetamol 500mg', dose: '1 tablet', status: 'pending' },
];

const MedicationRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const [isAdministerDialogOpen, setIsAdministerDialogOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<typeof medicationSchedule[0] | null>(null);
  const [notes, setNotes] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdminister = (med: typeof medicationSchedule[0]) => {
    setSelectedMed(med);
    setNotes('');
    setIsAdministerDialogOpen(true);
  };

  const handleConfirmAdminister = () => {
    toast.success(`${selectedMed?.medicine} administered to ${selectedPatient?.name}`);
    setIsAdministerDialogOpen(false);
  };

  return (
    <DashboardLayout requiredRole="nurse">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medication Administration</h1>
          <p className="text-muted-foreground">Track and record medication administration</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-4">Select Patient</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patient..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <p className="font-medium">{patient.name}</p>
                  <p className={`text-sm ${selectedPatient?.id === patient.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {patient.mrNo} | {patient.ward} - {patient.bed}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Medication Schedule */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            {selectedPatient ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedPatient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.mrNo} | {selectedPatient.ward} - Bed {selectedPatient.bed}
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Medication
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicationSchedule.map((med, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{med.time}</TableCell>
                        <TableCell>{med.medicine}</TableCell>
                        <TableCell>{med.dose}</TableCell>
                        <TableCell>
                          <span className={med.status === 'given' ? 'badge-completed' : 'badge-pending'}>
                            {med.status === 'given' ? 'Given' : 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {med.status === 'pending' && (
                            <Button size="sm" onClick={() => handleAdminister(med)}>
                              Administer
                            </Button>
                          )}
                          {med.status === 'given' && (
                            <span className="text-green-600 flex items-center justify-end gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Done
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a patient to view medication schedule</p>
              </div>
            )}
          </div>
        </div>

        {/* Administer Dialog */}
        <Dialog open={isAdministerDialogOpen} onOpenChange={setIsAdministerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Administer Medication</DialogTitle>
              <DialogDescription>
                Confirm medication administration for {selectedPatient?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">{selectedMed?.medicine}</p>
                <p className="text-sm text-muted-foreground">
                  Dose: {selectedMed?.dose} | Scheduled: {selectedMed?.time}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Administration Notes</Label>
                <Textarea
                  placeholder="Any observations or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdministerDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmAdminister}>Confirm Administration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MedicationRecords;
