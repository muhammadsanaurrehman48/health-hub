import React, { useState, useEffect, useMemo } from 'react';
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
  Printer,
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

const ReceptionistReferrals: React.FC = () => {
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
  const [patientNo, setPatientNo] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [externalHospital, setExternalHospital] = useState('');
  const [referredDoctor, setReferredDoctor] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [reasonForReferral, setReasonForReferral] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');

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
          name: p.name || 'Unknown',
          forceNo: p.forceNo || '',
          age: p.age || '',
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
      setPatientNo(patient.mrNo || '');
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
        referredDoctor: referredDoctor || 'To be assigned',
        diagnosis,
        reasonForReferral,
        urgency,
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
    setPatientNo('');
    setPatientName('');
    setPatientAge('');
    setPatientGender('');
    setPatientPhone('');
    setExternalHospital('');
    setReferredDoctor('');
    setDiagnosis('');
    setReasonForReferral('');
    setUrgency('routine');
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
        patientNo: referral.patientNo || '',
        age: referral.patientAge || 'N/A',
        gender: referral.patientGender || 'N/A',
        phone: referral.patientPhone || 'N/A',
      },
      referringDoctor: {
        name: referral.referringDoctorName || 'Reception Team',
        specialization: 'Hospital Reception',
        qualification: 'Trained Staff',
        department: 'Reception',
      },
      referredTo: {
        department: referral.referredTo,
        doctor: referral.referredDoctor || undefined,
        hospital: referral.referredTo,
      },
      diagnosis: referral.diagnosis,
      reasonForReferral: referral.reasonForReferral || 'External consultation required.',
      clinicalHistory: referral.clinicalHistory || 'See patient records.',
      treatmentGiven: referral.treatmentGiven || 'Initial assessment provided.',
      investigationsDone: referral.investigationsDone || [],
      urgency: referral.urgency || 'routine',
      notes: referral.notes || '',
    });
    setIsSheetOpen(true);
  };

  const handlePrintReferral = (referral: any) => {
    const printWindow = window.open('', '', 'height=800,width=900');
    if (!printWindow) return;
    
    const forceNoRow = referral.forceNo ? `<p><strong>Force No:</strong> <span style="font-weight: 500;">${referral.forceNo}</span></p>` : '';
    const patientNoRow = referral.patientNo ? `<p><strong>Patient No:</strong> <span style="font-weight: 500;">${referral.patientNo}</span></p>` : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Referral - ${referral.referralNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              background: white;
              max-width: 900px;
              margin: 0 auto;
              padding: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e0e0e0;
            }
            .header h1 {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .header p {
              font-size: 12px;
              color: #666;
              margin: 2px 0;
            }
            .referral-no {
              font-size: 14px;
              font-weight: 600;
              color: #0066cc;
              margin-top: 10px;
            }
            .section {
              margin: 20px 0;
              padding: 15px;
              border-left: 3px solid #0066cc;
              background: #f9f9f9;
            }
            .section h3 {
              font-size: 13px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .section p {
              font-size: 12px;
              margin: 5px 0;
              line-height: 1.5;
            }
            .section strong {
              color: #0066cc;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 20px 0;
            }
            .box {
              border: 1px solid #ddd;
              padding: 12px;
              border-radius: 4px;
            }
            .urgency-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              margin: 5px 0;
            }
            .urgent { background: #fee2e2; color: #991b1b; }
            .routine { background: #e0f2fe; color: #0c4a6e; }
            .emergency { background: #fff5f5; color: #a3001d; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 11px;
              color: #666;
              text-align: center;
            }
            .signature-area {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 40px;
              text-align: center;
            }
            .signature {
              border-top: 1px solid #000;
              padding-top: 10px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>PATIENT REFERRAL LETTER</h1>
              <p>Smart Hospital - Reception Department</p>
              <p>Phone: +92-21-XXXX-XXXX | Email: info@smarthospital.pk</p>
              <div class="referral-no">Referral No: ${referral.referralNo}</div>
            </div>

            <div class="section">
              <h3>Referral Details</h3>
              <div class="urgency-badge ${referral.urgency}">${referral.urgency.toUpperCase()}</div>
              <p><strong>Date:</strong> ${referral.date}</p>
              <p><strong>Referred To:</strong> ${referral.referredTo}</p>
              ${referral.referredDoctor ? `<p><strong>Referred Doctor:</strong> ${referral.referredDoctor}</p>` : ''}
            </div>

            <div class="grid">
              <div class="box">
                <h3 style="font-size: 12px; margin-bottom: 8px; color: #0066cc;">PATIENT INFORMATION</h3>
                <p><strong>Name:</strong> ${referral.patientName}</p>
                ${forceNoRow}
                ${patientNoRow}
                <p><strong>Age:</strong> ${patientAge || 'N/A'}</p>
                <p><strong>Gender:</strong> ${patientGender || 'N/A'}</p>
                <p><strong>Phone:</strong> ${patientPhone || 'N/A'}</p>
              </div>

              <div class="box">
                <h3 style="font-size: 12px; margin-bottom: 8px; color: #0066cc;">CLINICAL INFORMATION</h3>
                <p><strong>Diagnosis:</strong> ${referral.diagnosis}</p>
                <p><strong>Reason for Referral:</strong> ${referral.reasonForReferral}</p>
              </div>
            </div>

            <div class="section">
              <h3>Referred By</h3>
              <p><strong>Department:</strong> Hospital Reception</p>
              <p><strong>Date of Referral:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="signature-area">
              <div class="signature">
                <p>Receptionist Signature</p>
              </div>
              <div class="signature">
                <p>Receiving Hospital Seal</p>
              </div>
            </div>

            <div class="footer">
              <p>This is an official referral letter from Smart Hospital. Patient should submit this along with medical records.</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

  const getUrgencyBadge = (urgency: string) => {
    const styles: Record<string, string> = {
      routine: 'bg-blue-100 text-blue-800',
      urgent: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return <Badge className={styles[urgency] || 'bg-muted'}>{urgency}</Badge>;
  };

  const filteredReferrals = referrals.filter((ref) =>
    ref.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ref.forceNo && ref.forceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (ref.patientNo && ref.patientNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ref.referralNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout requiredRole="receptionist">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patient Referrals</h2>
            <p className="text-muted-foreground">Manage patient referrals to other hospitals or specialists</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Referral
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
                      <Label>Patient Name *</Label>
                      <Input
                        placeholder="Patient name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                      />
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
                      <Label>Patient No (Optional)</Label>
                      <Input
                        placeholder="PAT-XXXXXX"
                        value={patientNo}
                        onChange={(e) => setPatientNo(e.target.value)}
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
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
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
                    Referral Destination
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Referred To Hospital *</Label>
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
                    <div className="space-y-2 col-span-2">
                      <Label>Referred Doctor (Optional)</Label>
                      <Input
                        placeholder="Doctor name if known"
                        value={referredDoctor}
                        onChange={(e) => setReferredDoctor(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Urgency Level</Label>
                      <Select value={urgency} onValueChange={(v: any) => setUrgency(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
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
                        placeholder="Enter patient diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Referral *</Label>
                      <Textarea
                        placeholder="Why is this referral needed?"
                        value={reasonForReferral}
                        onChange={(e) => setReasonForReferral(e.target.value)}
                        className="min-h-20"
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
            placeholder="Search by name, Force No, or Patient No"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Referrals ({filteredReferrals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referral No</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Force No</TableHead>
                    <TableHead>Patient No</TableHead>
                    <TableHead>Referred To</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-bold text-primary">{referral.referralNo}</TableCell>
                        <TableCell className="font-medium">{referral.patientName}</TableCell>
                        <TableCell>{referral.forceNo || '-'}</TableCell>
                        <TableCell>{referral.patientNo || '-'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{referral.referredTo}</p>
                            {referral.referredDoctor && (
                              <p className="text-xs text-muted-foreground">{referral.referredDoctor}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-sm">{referral.diagnosis}</TableCell>
                        <TableCell>{getUrgencyBadge(referral.urgency)}</TableCell>
                        <TableCell className="text-sm">{referral.date}</TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleViewReferral(referral)}
                              title="View referral"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handlePrintReferral(referral)}
                              title="Print referral"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No referrals found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Referral View Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Referral Letter Preview</SheetTitle>
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

export default ReceptionistReferrals;
