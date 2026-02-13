import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ReferralLetterTemplate from '@/components/templates/ReferralLetterTemplate';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  Plus,
  Search,
  Eye,
  FileText,
  Send,
  Building,
  User,
  Loader2,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Patient dropdown state
  const [patients, setPatients] = useState<any[]>([]);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearchInput, setPatientSearchInput] = useState('');

  // Form state
  const [forceNo, setForceNo] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [externalHospital, setExternalHospital] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [reasonForReferral, setReasonForReferral] = useState('');

  useEffect(() => {
    fetchReferrals();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.getPatients();
      if (response.success && response.data) {
        const patientList = (Array.isArray(response.data) ? response.data : []).map((p: any) => ({
          id: p._id || p.id,
          mrNo: p.mrNo || p.patientNo || '',
          name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || 'Unknown',
          forceNo: p.forceNo || '',
          age: p.age || (p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : ''),
          gender: p.gender || '',
          phone: p.phone || '',
        }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  // Filter patients based on search input
  const filteredPatients = useMemo(() => {
    if (!patientSearchInput) return patients;
    const search = patientSearchInput.toLowerCase();
    return patients.filter(p => 
      p.name?.toLowerCase().includes(search) ||
      p.mrNo?.toLowerCase().includes(search) ||
      p.forceNo?.toLowerCase().includes(search)
    );
  }, [patients, patientSearchInput]);

  // Handle patient selection from dropdown
  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setPatientName(patient.name);
      setForceNo(patient.forceNo || '');
      setPatientAge(patient.age ? String(patient.age) : '');
      setPatientGender(patient.gender || '');
      setPatientPhone(patient.phone || '');
    }
    setPatientSearchOpen(false);
  };

  const fetchReferrals = async () => {
    try {
      const response = await api.getReferrals();
      if (response.success) {
        setReferrals(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async () => {
    if (!patientName || !externalHospital || !diagnosis || !reasonForReferral) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await api.createReferral({
        patientName,
        forceNo,
        patientAge: patientAge ? parseInt(patientAge) : undefined,
        patientGender,
        patientPhone,
        referredTo: externalHospital,
        diagnosis,
        reasonForReferral,
        urgency: 'routine',
      });

      if (response.success) {
        toast.success('Referral created successfully!', {
          description: `Referral No: ${response.data.referralNo}`,
        });
        fetchReferrals();
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error(response.message || 'Failed to create referral');
      }
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to create referral');
    }
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
    setSelectedPatientId('');
    setPatientSearchInput('');
  };

  const handleViewReferral = (referral: any) => {
    setSelectedReferral({
      referralNo: referral.referralNo,
      date: referral.date || referral.createdAt?.split('T')[0],
      patient: {
        name: referral.patientName,
        forceNo: referral.forceNo || '',
        age: referral.patientAge || 'N/A',
        gender: referral.patientGender || 'N/A',
        phone: referral.patientPhone || 'N/A',
      },
      referringDoctor: {
        name: referral.referringDoctorName || 'Doctor',
        specialization: 'General Medicine',
        qualification: 'MBBS, FCPS',
        department: 'Medical OPD',
      },
      referredTo: {
        department: referral.referredTo,
        doctor: referral.referredDoctor || undefined,
        hospital: referral.referredTo,
      },
      diagnosis: referral.diagnosis,
      reasonForReferral: referral.reasonForReferral || 'Specialized consultation and management required.',
      clinicalHistory: referral.clinicalHistory || 'See patient records for details.',
      treatmentGiven: referral.treatmentGiven || 'Initial treatment as per records.',
      investigationsDone: referral.investigationsDone || [],
      urgency: referral.urgency || 'routine',
      notes: referral.notes || '',
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

  const filteredReferrals = referrals.filter((ref) =>
    ref.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ref.forceNo && ref.forceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ref.referralNo?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    {/* Patient Search Dropdown */}
                    <div className="space-y-2 col-span-2">
                      <Label>Search & Select Patient *</Label>
                      <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={patientSearchOpen}
                            className="w-full justify-between"
                          >
                            {selectedPatientId
                              ? patients.find((p) => p.id === selectedPatientId)?.name + 
                                (patients.find((p) => p.id === selectedPatientId)?.mrNo 
                                  ? ` - ${patients.find((p) => p.id === selectedPatientId)?.mrNo}` 
                                  : '')
                              : "Search patient by name, MR No, or Force No..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Type to search patients..."
                              value={patientSearchInput}
                              onValueChange={setPatientSearchInput}
                            />
                            <CommandList>
                              <CommandEmpty>No patient found. You can enter details manually below.</CommandEmpty>
                              <CommandGroup>
                                {filteredPatients.slice(0, 10).map((patient) => (
                                  <CommandItem
                                    key={patient.id}
                                    value={patient.id}
                                    onSelect={() => handlePatientSelect(patient.id)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedPatientId === patient.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{patient.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {patient.mrNo && `MR: ${patient.mrNo}`}
                                        {patient.forceNo && ` | Force: ${patient.forceNo}`}
                                        {patient.phone && ` | ${patient.phone}`}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground">
                        Select from registered patients or enter details manually below
                      </p>
                    </div>
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
