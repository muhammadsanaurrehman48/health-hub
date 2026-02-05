import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

const mockPrescriptions = [
  { id: '1', rxNo: 'RX-456789', patientName: 'Muhammad Ali', mrNo: 'MR-001234', doctor: 'Dr. Ahmad Khan', medicines: 3, date: '2025-02-01 10:30 AM', status: 'pending' },
  { id: '2', rxNo: 'RX-456788', patientName: 'Fatima Begum', mrNo: 'MR-001235', doctor: 'Dr. Sara Ali', medicines: 4, date: '2025-02-01 10:15 AM', status: 'dispensed' },
  { id: '3', rxNo: 'RX-456787', patientName: 'Ahmed Khan', mrNo: 'MR-001236', doctor: 'Dr. Usman Malik', medicines: 2, date: '2025-02-01 09:45 AM', status: 'dispensed' },
  { id: '4', rxNo: 'RX-456786', patientName: 'Sara Bibi', mrNo: 'MR-001237', doctor: 'Dr. Ahmad Khan', medicines: 5, date: '2025-02-01 09:30 AM', status: 'pending' },
];

const PharmacyPrescriptions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<any>(null);

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
    labTests: [],
    radiologyTests: [],
    notes: 'Low salt diet recommended.',
    followUpDate: '2025-03-01',
  };

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

  const handleDispense = (rxNo: string) => {
    toast.success(`Prescription ${rxNo} dispensed successfully!`);
  };

  const handleViewPrescription = (rx: typeof mockPrescriptions[0]) => {
    setSelectedRx(rx);
    setIsViewSheetOpen(true);
  };

  const filteredPrescriptions = mockPrescriptions.filter((rx) =>
    rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.mrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.rxNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <p className="text-2xl font-bold">{mockPrescriptions.filter(r => r.status === 'pending').length}</p>
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
                  <p className="text-2xl font-bold">{mockPrescriptions.filter(r => r.status === 'dispensed').length}</p>
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
                  <p className="text-2xl font-bold">{mockPrescriptions.reduce((sum, r) => sum + r.medicines, 0)}</p>
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
                      <Badge variant="outline">{rx.medicines} medicines</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{rx.date}</TableCell>
                    <TableCell>{getStatusBadge(rx.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {rx.status === 'pending' && (
                          <Button size="sm" onClick={() => handleDispense(rx.rxNo)}>
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
              <PrescriptionTemplate data={samplePrescriptionData} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyPrescriptions;
