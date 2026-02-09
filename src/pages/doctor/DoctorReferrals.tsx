import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import ReferralLetterTemplate from '@/components/templates/ReferralLetterTemplate';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Eye,
  FileText,
  Send,
  Building,
  User,
} from 'lucide-react';

const mockReferrals = [
  {
    id: '1',
    referralNo: 'REF-2025-001',
    patientName: 'Muhammad Ali',
    forceNo: 'F-12345',
    referredTo: 'NICVD Hospital Karachi',
    referredDoctor: 'Dr. Imran Shah',
    date: '2025-02-06',
    urgency: 'urgent' as const,
    status: 'pending',
    diagnosis: 'Suspected cardiac arrhythmia',
  },
  {
    id: '2',
    referralNo: 'REF-2025-002',
    patientName: 'Fatima Begum',
    forceNo: 'F-12346',
    referredTo: 'SIUT Hospital Karachi',
    referredDoctor: 'Dr. Khalid Mehmood',
    date: '2025-02-05',
    urgency: 'routine' as const,
    status: 'accepted',
    diagnosis: 'Chronic kidney issues',
  },
  {
    id: '3',
    referralNo: 'REF-2025-003',
    patientName: 'Ahmed Khan',
    forceNo: 'F-12347',
    referredTo: 'CMH Malir Cantt, Karachi',
    referredDoctor: 'Dr. Rashid Khan',
    date: '2025-02-04',
    urgency: 'emergency' as const,
    status: 'transferred',
    diagnosis: 'Severe trauma - RTA',
  },
];

const karachiHospitals = [
  'NICVD Hospital Karachi',
  'CMH Malir Cantt, Karachi',
  'MMI Hospital',
  'SIUT Hospital Karachi',
  'Kidney Centre Karachi',
  'JPMC Karachi',
  'SIAG Hospital Karachi',
  'NICH Hospital Karachi',
  'Dow University Olha Campus',
  'Civil Hospital Karachi',
];

const DoctorReferrals: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  // Form state
  const [forceNo, setForceNo] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [externalHospital, setExternalHospital] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [reasonForReferral, setReasonForReferral] = useState('');

  const handleCreateReferral = () => {
    if (!patientName || !externalHospital || !diagnosis || !reasonForReferral) {
      toast.error('Please fill all required fields');
      return;
    }

    const referralNo = `REF-${new Date().getFullYear()}-${String(mockReferrals.length + 1).padStart(3, '0')}`;
    
    toast.success('Referral created successfully!', {
      description: `Referral No: ${referralNo}`,
    });
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForceNo('');
    setPatientName('');
    setPatientAge('');
    setPatientGender('');
    setPatientPhone('');
    setExternalHospital('');
    setDiagnosis('');
    setReasonForReferral('');
  };

  const handleViewReferral = (referral: typeof mockReferrals[0]) => {
    setSelectedReferral({
      referralNo: referral.referralNo,
      date: referral.date,
      patient: {
        name: referral.patientName,
        forceNo: referral.forceNo,
        age: 45,
        gender: 'Male',
        phone: '0300-1234567',
      },
      referringDoctor: {
        name: 'Dr. Ahmad Khan',
        specialization: 'General Medicine',
        qualification: 'MBBS, FCPS',
        department: 'Medical OPD',
      },
      referredTo: {
        department: referral.referredTo,
        doctor: referral.referredDoctor || undefined,
        hospital: referral.referredTo.includes('CMH') || referral.referredTo.includes('AFIC') ? referral.referredTo : undefined,
      },
      diagnosis: referral.diagnosis,
      reasonForReferral: 'Specialized consultation and management required.',
      clinicalHistory: 'Patient presenting with symptoms for the past 2 weeks. Initial treatment provided but symptoms persist.',
      treatmentGiven: 'Symptomatic treatment with analgesics and anti-inflammatory medications.',
      investigationsDone: ['Complete Blood Count', 'ECG', 'Chest X-Ray'],
      urgency: referral.urgency,
      notes: 'Patient is cooperative and ambulatory.',
    });
    setIsSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning text-warning-foreground',
      accepted: 'bg-success text-success-foreground',
      transferred: 'bg-primary',
      completed: 'bg-muted',
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status}</Badge>;
  };

  const filteredReferrals = mockReferrals.filter((ref) =>
    ref.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.forceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.referralNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patient Referrals</h2>
            <p className="text-muted-foreground">Refer patients to other departments or hospitals</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Referral
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Patient Referral</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Force No (Optional)</Label>
                      <Input
                        placeholder="Enter Force No if available"
                        value={forceNo}
                        onChange={(e) => setForceNo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Patient Name *</Label>
                      <Input
                        placeholder="Patient name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        placeholder="Age"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={patientGender} onValueChange={setPatientGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="03XX-XXXXXXX"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Referral Destination */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Referred to Hospital
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Hospital *</Label>
                      <Select value={externalHospital} onValueChange={setExternalHospital}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          {karachiHospitals.map((hosp) => (
                            <SelectItem key={hosp} value={hosp}>{hosp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Clinical Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Referral Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Diagnosis *</Label>
                      <Textarea
                        placeholder="Enter diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Referral *</Label>
                      <Textarea
                        placeholder="Why is this referral needed?"
                        value={reasonForReferral}
                        onChange={(e) => setReasonForReferral(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReferral}>
                  <Send className="w-4 h-4 mr-2" />
                  Create Referral
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or Force No"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral No</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Force No</TableHead>
                  <TableHead>Referred To</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-bold text-primary">{referral.referralNo}</TableCell>
                    <TableCell className="font-medium">{referral.patientName}</TableCell>
                    <TableCell>{referral.forceNo}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{referral.referredTo}</p>
                        {referral.referredDoctor && (
                          <p className="text-xs text-muted-foreground">{referral.referredDoctor}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{referral.diagnosis}</TableCell>
                    <TableCell>{referral.date}</TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleViewReferral(referral)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Referral View Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Referral Letter</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {selectedReferral && <ReferralLetterTemplate data={selectedReferral} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default DoctorReferrals;
