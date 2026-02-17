import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import TokenTemplate from '@/components/templates/TokenTemplate';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  Ticket,
  Plus,
  Search,
  Printer,
  Clock,
  BedDouble,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const EntriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false);
  const [isTokenSheetOpen, setIsTokenSheetOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  
  // Dynamic data states
  const [opdTokens, setOpdTokens] = useState<any[]>([]);
  const [ipdEntries, setIpdEntries] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Token form
  const [tokenPatientName, setTokenPatientName] = useState('');
  const [tokenMrNo, setTokenMrNo] = useState('');
  const [tokenDepartment, setTokenDepartment] = useState('');
  const [tokenDoctor, setTokenDoctor] = useState('');

  // IPD form
  const [ipdPatientName, setIpdPatientName] = useState('');
  const [ipdMrNo, setIpdMrNo] = useState('');
  const [ipdWard, setIpdWard] = useState('');
  const [ipdBed, setIpdBed] = useState('');
  const [ipdDoctor, setIpdDoctor] = useState('');

  // Fetch data
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [queueRes, admittedRes, patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
        api.getAllQueues().catch(() => ({ success: false, data: [] })),
        api.getAdmittedPatients().catch(() => ({ success: false, data: [] })),
        api.getPatients().catch(() => ({ success: false, data: [] })),
        api.getAppointments?.() ? api.getAppointments().catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: false, data: [] }),
        api.getDoctors().catch(() => ({ success: false, data: [] })),
      ]);

      // Transform queue data to OPD tokens
      let tokens: any[] = [];
      
      // First, get tokens from queues (patients array now included in response)
      if (queueRes.success && queueRes.data) {
        tokens = (Array.isArray(queueRes.data) ? queueRes.data : []).flatMap((queue: any) => 
          (queue.patients || []).map((p: any, idx: number) => ({
            id: p._id || p.appointmentId || `${queue.id}-${idx}`,
            tokenNo: p.tokenNo || `OPD-${String(idx + 1).padStart(3, '0')}`,
            patientName: p.patientName || 'Unknown',
            mrNo: p.patientNo || '',
            department: queue.department || 'General',
            doctor: queue.doctorName || 'Assigned Doctor',
            roomNo: queue.roomNo,
            time: p.createdAt ? format(new Date(p.createdAt), 'hh:mm a') : format(new Date(), 'hh:mm a'),
            status: p.status || 'waiting',
            forceNo: p.forceNo || '',
          }))
        );
      }

      // Also add appointments that are scheduled/vitals_recorded for today (fallback)
      if (appointmentsRes.success && appointmentsRes.data && tokens.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        const appointmentTokens = (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [])
          .filter((apt: any) => apt.date === today && (apt.status === 'scheduled' || apt.status === 'vitals_recorded'))
          .map((apt: any) => ({
            id: apt.id || apt._id,
            tokenNo: apt.token || apt.appointmentNo || `TKN-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            patientName: apt.patient || apt.patientName || 'Unknown',
            mrNo: apt.mrNo || '',
            department: apt.department || 'OPD',
            doctor: apt.doctor || apt.doctorName || 'Assigned Doctor',
            time: apt.time || format(new Date(), 'hh:mm a'),
            status: apt.status || 'scheduled',
            isAppointment: true,
          }));
        tokens = appointmentTokens;
      }

      setOpdTokens(tokens);

      // Set IPD entries
      if (admittedRes.success && admittedRes.data) {
        const entries = (Array.isArray(admittedRes.data) ? admittedRes.data : []).map((p: any) => ({
          id: p._id || p.id,
          admissionNo: p.admissionNo || `IPD-${new Date().getFullYear()}-${String(Math.random() * 1000).slice(0, 3)}`,
          patientName: p.name || p.patientName || 'Unknown',
          mrNo: p.mrNo || p.patientNo || '',
          ward: p.ward || 'General Ward',
          bed: p.bed || 'Unassigned',
          doctor: p.doctor?.name || p.doctorName || 'Assigned Doctor',
          admitDate: p.admitDate ? format(new Date(p.admitDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          status: p.status || 'admitted',
        }));
        setIpdEntries(entries);
      }

      // Extract unique departments from queue data
      if (queueRes.success && queueRes.data) {
        const uniqueDepts: any = {};
        (Array.isArray(queueRes.data) ? queueRes.data : []).forEach((queue: any) => {
          if (queue.department?.name || queue.departmentName) {
            const deptName = queue.department?.name || queue.departmentName;
            uniqueDepts[deptName] = true;
          }
        });
        setDepartments(Object.keys(uniqueDepts).map(d => ({ name: d })));
      }

      // Set doctors from dedicated endpoint
      if (doctorsRes.success && doctorsRes.data) {
        const doctorsList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
        const formattedDoctors = doctorsList.map((doc: any) => ({
          id: doc.id || doc._id,
          name: doc.name || (doc.firstName && doc.lastName ? `${doc.firstName} ${doc.lastName}` : 'Unknown'),
          department: doc.department || 'OPD',
          roomNo: doc.roomNo || doc.room || doc.assignedRoom || '',
        }));
        setDoctors(formattedDoctors);
        console.log('✅ [FRONTEND] Doctors loaded for OPD/IPD selection:', formattedDoctors.length, 'doctors');
      } else {
        console.warn('⚠️ [FRONTEND] Failed to load doctors from endpoint');
        setDoctors([]);
      }

      // Set patients from fetched list
      if (patientsRes.success && patientsRes.data) {
        const patientList = (Array.isArray(patientsRes.data) ? patientsRes.data : []).map((p: any) => ({
          id: p._id || p.id,
          name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || 'Unknown',
          mrNo: p.mrNo || p.patientNo || '',
        }));
        setPatients(patientList);
      }

    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately on mount
    fetchData();

    // Check if we were just redirected from patient registration
    if (sessionStorage.getItem('refreshPatients') === 'true') {
      sessionStorage.removeItem('refreshPatients');
      // Refetch to ensure new patient is visible in the dropdown
      setTimeout(() => fetchData(true), 500);
    }

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(true), 30000);

    // Refetch when page becomes visible (returns from another page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  const handleRefresh = () => fetchData(true);

  const handleGenerateToken = async () => {
    if (!tokenPatientName) {
      toast.error('Patient name is required');
      return;
    }
    if (!tokenDoctor) {
      toast.error('Doctor is required');
      return;
    }
    if (!tokenDepartment) {
      toast.error('Department is required');
      return;
    }
    try {
      // Find patient ID from patients list
      const selectedPatient = patients.find(p => p.name === tokenPatientName);
      if (!selectedPatient) {
        toast.error('Patient not found');
        return;
      }

      // Find doctor ID from doctors list
      const selectedDoctor = doctors.find(d => d.name === tokenDoctor);
      if (!selectedDoctor) {
        toast.error('Doctor not found');
        return;
      }

      // Create appointment with required fields
      const doctorRoom = selectedDoctor.roomNo ? String(selectedDoctor.roomNo) : '1';
      const appointmentData = {
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        roomNo: doctorRoom,
        date: new Date().toISOString().split('T')[0],
        time: format(new Date(), 'HH:mm'),
        reason: 'OPD Consultation',
      };
      
      const response = await api.createAppointment(appointmentData);
      
      if (response?.success) {
        const createdData = response.data || {};
        const invoiceInfo = createdData.invoice;
        const invoiceMsg = invoiceInfo
          ? ` | Invoice ${invoiceInfo.invoiceNo} (Rs. ${invoiceInfo.amount}) - ${invoiceInfo.paymentStatus}`
          : '';
        
        toast.success(`OPD Token generated successfully!${invoiceMsg}`);
        setIsTokenDialogOpen(false);
        setTokenPatientName('');
        setTokenMrNo('');
        setTokenDepartment('');
        setTokenDoctor('');
        
        // Immediately show token print sheet
        setSelectedToken({
          tokenNo: createdData.token || createdData.appointmentNo || 'N/A',
          patientName: createdData.patientName || tokenPatientName,
          mrNo: createdData.mrNo || tokenMrNo || '',
          department: createdData.department || tokenDepartment || 'OPD',
          doctor: createdData.doctor || tokenDoctor,
          date: format(new Date(), 'dd/MM/yyyy'),
          time: createdData.time || format(new Date(), 'hh:mm a'),
          type: 'OPD' as const,
        });
        setIsTokenSheetOpen(true);
        
        // Refresh the list from database to get official data
        setTimeout(() => fetchData(true), 500);
      } else {
        toast.error('Failed to generate OPD token', {
          description: response?.message || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate token', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleAdmitPatient = async () => {
    if (!ipdPatientName) {
      toast.error('Patient name is required');
      return;
    }
    if (!ipdWard) {
      toast.error('Ward is required');
      return;
    }
    if (!ipdBed) {
      toast.error('Bed number is required');
      return;
    }
    try {
      // Find patient ID from patients list
      const selectedPatient = patients.find(p => p.name === ipdPatientName);
      if (!selectedPatient) {
        toast.error('Patient not found');
        console.error('❌ [FRONTEND] Patient not found. Available patients:', patients.map(p => p.name));
        return;
      }

      // Find doctor ID from doctors list if available
      const selectedDoctor = ipdDoctor ? doctors.find(d => d.name === ipdDoctor || d.id === ipdDoctor) : null;

      // Create admission with required fields
      const admissionData = {
        patientId: selectedPatient.id,
        name: ipdPatientName,
        mrNo: selectedPatient.mrNo,
        patientNo: selectedPatient.mrNo, // Send both for compatibility
        ward: ipdWard,
        bed: ipdBed,
        doctor: selectedDoctor?.name || 'Assigned Doctor',
        ...(selectedDoctor && { doctorId: selectedDoctor.id }),
      };
      
      console.log('📝 [FRONTEND] Creating admission with data:', admissionData);
      console.log('👤 [FRONTEND] Selected patient object:', selectedPatient);
      
      const response = await api.createAdmission(admissionData);
      
      console.log('📤 [FRONTEND] Admission response:', response);
      
      if (response?.success) {
        toast.success('Patient admitted successfully!');
        setIsIPDDialogOpen(false);
        setIpdPatientName('');
        setIpdMrNo('');
        setIpdWard('');
        setIpdBed('');
        setIpdDoctor('');
        
        // Refresh the list immediately
        console.log('🔄 [FRONTEND] Refreshing admissions list...');
        setTimeout(() => fetchData(true), 500);
      } else {
        toast.error('Failed to admit patient', {
          description: response?.message || 'Unknown error',
        });
        console.error('❌ [FRONTEND] Admission failed:', response?.message);
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Error admitting patient:', error);
      toast.error('Failed to admit patient', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleViewToken = (token: any) => {
    setSelectedToken({
      tokenNo: token.tokenNo,
      patientName: token.patientName,
      mrNo: token.mrNo,
      department: token.department,
      doctor: token.doctor,
      date: format(new Date(), 'dd/MM/yyyy'),
      time: token.time,
      type: 'OPD' as const,
    });
    setIsTokenSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      waiting: 'bg-warning text-warning-foreground',
      'in-progress': 'bg-primary',
      completed: 'bg-success text-success-foreground',
      admitted: 'bg-primary',
      critical: 'bg-destructive',
      discharged: 'bg-muted',
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status}</Badge>;
  };

  // Filter tokens based on search
  const filteredOpdTokens = opdTokens.filter((t) =>
    t.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.mrNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tokenNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIpdEntries = ipdEntries.filter((e) =>
    e.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.mrNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2 className="text-2xl font-bold text-foreground">OPD / IPD Entries</h2>
            <p className="text-muted-foreground">Manage patient tokens and admissions</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="opd" className="space-y-6">
          <TabsList>
            <TabsTrigger value="opd" className="gap-2">
              <Ticket className="w-4 h-4" />
              OPD Tokens
            </TabsTrigger>
            <TabsTrigger value="ipd" className="gap-2">
              <BedDouble className="w-4 h-4" />
              IPD Admissions
            </TabsTrigger>
          </TabsList>

          {/* OPD Tab */}
          <TabsContent value="opd" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or Force No"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Token
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate OPD Token</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Patient Name <span className="text-destructive">*</span></Label>
                      <Select value={tokenPatientName} onValueChange={setTokenPatientName}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length > 0 ? (
                            patients.map((patient: any) => (
                              <SelectItem key={patient.id} value={patient.name}>
                                {patient.name} ({patient.mrNo})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No patients registered</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>MR No / Force No <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                      <Input
                        placeholder="Enter MR No or Force No if available"
                        value={tokenMrNo}
                        onChange={(e) => setTokenMrNo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={tokenDepartment} onValueChange={setTokenDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.length > 0 ? (
                            departments.map((d: any) => (
                              <SelectItem key={d._id || d.id || d.name} value={d.name}>{d.name}</SelectItem>
                            ))
                          ) : (
                            ['Cardiology', 'Pediatrics', 'Orthopedics', 'Gynecology', 'General', 'ENT', 'Dermatology'].map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Doctor <span className="text-destructive">*</span></Label>
                      <Select value={tokenDoctor} onValueChange={setTokenDoctor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors && doctors.length > 0 ? (
                            doctors.map((doc: any) => (
                              <SelectItem key={doc.id || doc.name} value={doc.name || doc.id}>
                                {doc.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>Select a doctor first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTokenDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateToken}>
                      <Ticket className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's OPD Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token No</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR No</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOpdTokens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No OPD tokens found for today
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOpdTokens.map((token) => (
                        <TableRow key={token.id}>
                          <TableCell className="font-bold text-primary">{token.tokenNo}</TableCell>
                          <TableCell className="font-medium">{token.patientName}</TableCell>
                          <TableCell>{token.mrNo || '-'}</TableCell>
                          <TableCell>{token.department}</TableCell>
                          <TableCell>{token.doctor}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {token.time}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(token.status)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleViewToken(token)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleViewToken(token)}>
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
          </TabsContent>

          {/* IPD Tab */}
          <TabsContent value="ipd" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search admissions"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dialog open={isIPDDialogOpen} onOpenChange={setIsIPDDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Admit Patient
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Admit Patient (IPD)</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Patient Name <span className="text-destructive">*</span></Label>
                      <Select value={ipdPatientName} onValueChange={setIpdPatientName}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length > 0 ? (
                            patients.map((patient: any) => (
                              <SelectItem key={patient.id} value={patient.name}>
                                {patient.name} ({patient.mrNo})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No patients registered</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>MR No / Force No <span className="text-muted-foreground text-xs">(Auto-filled)</span></Label>
                      <Input
                        placeholder="Auto-filled from selected patient"
                        value={ipdMrNo}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ward</Label>
                      <Select value={ipdWard} onValueChange={setIpdWard}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {['General Ward A', 'General Ward B', 'Private Room', 'ICU', 'NICU', 'Surgical Ward'].map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bed Number</Label>
                      <Input
                        placeholder="e.g., A-12"
                        value={ipdBed}
                        onChange={(e) => setIpdBed(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Attending Doctor</Label>
                      <Select value={ipdDoctor} onValueChange={setIpdDoctor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors && doctors.length > 0 ? (
                            doctors.map((doc: any) => (
                              <SelectItem key={doc._id || doc.id} value={doc._id || doc.id}>
                                {doc.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>Select a doctor first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsIPDDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdmitPatient}>
                      <BedDouble className="w-4 h-4 mr-2" />
                      Admit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Admissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR No</TableHead>
                      <TableHead>Ward</TableHead>
                      <TableHead>Bed</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Admit Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIpdEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No IPD admissions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIpdEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-bold text-primary">{entry.admissionNo}</TableCell>
                          <TableCell className="font-medium">{entry.patientName}</TableCell>
                          <TableCell>{entry.mrNo || '-'}</TableCell>
                          <TableCell>{entry.ward}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.bed}</Badge>
                          </TableCell>
                          <TableCell>{entry.doctor}</TableCell>
                          <TableCell>{entry.admitDate}</TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Token View/Print Sheet */}
        <Sheet open={isTokenSheetOpen} onOpenChange={setIsTokenSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>OPD Token</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {selectedToken && <TokenTemplate data={selectedToken} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default EntriesPage;
