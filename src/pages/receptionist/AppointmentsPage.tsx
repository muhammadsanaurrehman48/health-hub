import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Printer,
  Eye,
} from 'lucide-react';

const allowedRooms = ['1', '2', '3', '4'];

const getAppointmentDateKey = (appointment: any) => {
  const rawDate = appointment?.date || appointment?.appointmentDate || appointment?.appointment_date || appointment?.createdAt;
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : format(parsed, 'yyyy-MM-dd');
};

const getAppointmentTimestamp = (appointment: any) => {
  const raw = appointment?.createdAt || appointment?.date || appointment?.appointmentDate || appointment?.appointment_date;
  const parsed = raw ? new Date(raw).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortAppointmentsDesc = (items: any[]) =>
  [...items].sort((a, b) => {
    const timeDiff = getAppointmentTimestamp(b) - getAppointmentTimestamp(a);
    if (timeDiff !== 0) return timeDiff;
    const tokenDiff = (Number(b?.token) || 0) - (Number(a?.token) || 0);
    return tokenDiff;
  });

const AppointmentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New appointment form
  const [newPatientName, setNewPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');
  const [newRoomNo, setNewRoomNo] = useState('');

  // Token print sheet
  const [isTokenSheetOpen, setIsTokenSheetOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel with proper error handling
        const results = await Promise.allSettled([
          api.getAppointments(),
          api.getDoctors(),
          api.getPatients()
        ]);
        
        const [appointmentsResult, doctorsResult, patientsResult] = results;
        
        // Handle appointments
        if (appointmentsResult.status === 'fulfilled' && appointmentsResult.value?.success) {
          const appointmentsData = appointmentsResult.value.data || [];
          setAppointments(sortAppointmentsDesc(appointmentsData));
          console.log('✅ Appointments loaded:', appointmentsData.length, 'appointments');
          if (appointmentsData.length > 0) {
            console.log('Sample appointment structure:', appointmentsData[0]);
          }
        } else {
          console.error('❌ Failed to load appointments:', appointmentsResult.status);
        }
        
        // Handle doctors - from dedicated endpoint
        if (doctorsResult.status === 'fulfilled' && doctorsResult.value?.success) {
          const doctorsList = Array.isArray(doctorsResult.value.data) ? doctorsResult.value.data : [];
          const formattedDoctors = doctorsList.map((doc: any) => ({
            id: String(doc.id || doc._id || ''),
            name: doc.name || (doc.firstName && doc.lastName ? `${doc.firstName} ${doc.lastName}` : 'Unknown'),
            department: doc.department || 'OPD',
            slots: doc.slots || doc.available_slots || 10,
            max_slots: doc.max_slots || 10,
            roomNo: doc.roomNo || doc.room || doc.assignedRoom || '',
          }));
          setDoctors(formattedDoctors);
          console.log('✅ Doctors loaded successfully:', formattedDoctors.length, 'doctors');
          console.log('Sample doctor with slots:', formattedDoctors[0]);
        } else {
          console.error('❌ Failed to load doctors:', doctorsResult.status);
        }
        
        // Handle patients
        if (patientsResult.status === 'fulfilled' && patientsResult.value?.success) {
          const patients = Array.isArray(patientsResult.value.data) ? patientsResult.value.data : [];
          const patientList = patients.map((p: any) => ({
            id: p._id || p.id,
            name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || 'Unknown',
            mrNo: p.mrNo || p.patientNo || '',
            forceNo: p.forceNo || '',
          }));
          setPatients(patientList);
          console.log('✅ Patients loaded:', patientList.length, 'patients');
        }
        
        // Log results for debugging
        console.log('Appointments data sync complete');
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch data on mount
    fetchData();
    
    // Auto-refresh every 15 seconds to sync with doctor portal and queue display
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 15000);
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const selectedDoctor = doctors.find((doc) => doc.id === newDoctorId);
  const assignedRoomNo = selectedDoctor?.roomNo ? String(selectedDoctor.roomNo) : '';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-primary">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: 'completed' | 'cancelled') => {
    try {
      console.log(`📋 Updating appointment ${appointmentId} status to ${newStatus}...`);
      
      const response = await api.updateAppointment(appointmentId, { status: newStatus });
      
      if (response?.success) {
        toast.success(`Appointment marked as ${newStatus}`, {
          description: `Doctor slot has been ${newStatus === 'completed' ? 'released' : 'released'} for rescheduling`,
        });
        
        // Refresh data to show updated slots and status
        console.log('🔄 Refreshing appointments and doctor slots after status change...');
        const [appointmentsRes, doctorsRes] = await Promise.all([
          api.getAppointments(),
          api.getDoctors()
        ]);
        
        if (appointmentsRes?.success) {
          setAppointments(sortAppointmentsDesc(appointmentsRes.data || []));
          console.log('✅ Appointments refreshed');
        }
        
        if (doctorsRes?.success) {
          const formattedDoctors = (doctorsRes.data || []).map((doc: any) => ({
            id: doc.id || doc._id,
            name: doc.name,
            department: doc.department || 'OPD',
            slots: doc.slots || 0,
            max_slots: doc.max_slots || 10,
          }));
          setDoctors(formattedDoctors);
          console.log('✅ Doctors slots refreshed');
        }
      } else {
        toast.error(`Failed to update appointment: ${response?.message}`);
        console.error('❌ Update failed:', response);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error('Error updating appointment', { description: errorMsg });
      console.error('❌ Exception:', error);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedPatientId) {
      toast.error('Patient is required');
      return;
    }
    if (!newDoctorId) {
      toast.error('Doctor is required');
      return;
    }
    if (!newRoomNo) {
      toast.error('Room number is required');
      return;
    }
    
    try {
      // Find patient and doctor from lists
      const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients.find(p => p.name === newPatientName);
      const selectedDoctor = doctors.find(d => d.id === newDoctorId);
      
      if (!selectedPatient || !selectedDoctor) {
        toast.error('Invalid selection');
        return;
      }

      const doctorAssignedRoom = selectedDoctor.roomNo ? String(selectedDoctor.roomNo) : '';
      const roomToUse = doctorAssignedRoom || newRoomNo;

      if (!roomToUse) {
        toast.error('Room number is required');
        return;
      }

      if (!allowedRooms.includes(roomToUse)) {
        toast.error('Please choose a valid room (1-4)');
        return;
      }
      
      // Check if doctor has available slots
      const availableSlots = selectedDoctor.slots || 0;
      if (availableSlots <= 0) {
        toast.error(`${selectedDoctor.name} has no available slots`, {
          description: `Please select another doctor or another day.`,
        });
        return;
      }

      const appointmentData = {
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id || selectedDoctor._id,
        roomNo: roomToUse,
        date: format(selectedDate, 'yyyy-MM-dd'),
        reason: 'Consultation',
      };

      console.log('📝 Creating appointment:', appointmentData);
      console.log('📊 Doctor slots before appointment:', availableSlots);
      console.log('🏥 Assigning to room:', newRoomNo);

      // Call API to create appointment in database
      const response = await api.createAppointment(appointmentData);
      
      console.log('📤 Appointment creation response:', response);
      
      if (response?.success) {
        const createdData = response.data || {};
        const invoiceInfo = createdData.invoice;
        const invoiceMsg = invoiceInfo
          ? `Invoice ${invoiceInfo.invoiceNo} (Rs. ${invoiceInfo.amount}) - ${invoiceInfo.paymentStatus}`
          : '';
        
        toast.success('Appointment scheduled successfully!', {
          description: `Room ${roomToUse} | Dr. ${selectedDoctor.name} | Token: ${createdData.token || 'Generated'}${invoiceMsg ? ` | ${invoiceMsg}` : ''}`,
        });
        
        // Show token print dialog immediately
        setSelectedToken({
          tokenNo: createdData.token || createdData.appointmentNo || 'N/A',
          patientName: createdData.patientName || selectedPatient?.name || newPatientName,
          mrNo: createdData.mrNo || '',
          department: createdData.department || selectedDoctor.department || 'OPD',
          doctor: createdData.doctor || selectedDoctor.name,
          date: format(selectedDate, 'dd/MM/yyyy'),
          time: createdData.time || format(new Date(), 'hh:mm a'),
          type: 'OPD' as const,
        });
        setIsTokenSheetOpen(true);
        
        // Clear form
        setIsDialogOpen(false);
        setNewPatientName('');
        setSelectedPatientId('');
        setPatientSearch('');
        setNewDoctorId('');
        setNewRoomNo('');
        
        // Refresh both appointments AND doctors list to show updated slots
        console.log('🔄 Refreshing appointments and doctor slots...');
        const [appointmentsRes, doctorsRes] = await Promise.all([
          api.getAppointments(),
          api.getDoctors()
        ]);
        
        console.log('📥 Fresh appointments from database:', appointmentsRes?.data?.length, 'appointments');
        console.log('👨‍⚕️ Fresh doctors data with updated slots:', doctorsRes?.data?.length, 'doctors');
        
        if (appointmentsRes?.success) {
          setAppointments(sortAppointmentsDesc(appointmentsRes.data || []));
          console.log('✅ Appointments state updated');
        }
        
        if (doctorsRes?.success) {
          const formattedDoctors = (doctorsRes.data || []).map((doc: any) => ({
            id: doc.id || doc._id,
            name: doc.name,
            department: doc.department || 'OPD',
            slots: doc.slots || 0,
            max_slots: doc.max_slots || 10,
          }));
          setDoctors(formattedDoctors);
          console.log('✅ Doctors state updated with current slots');
        }
      } else {
        const errorMsg = response?.message || 'Unknown error';
        console.error('❌ API Response:', response);
        toast.error('Failed to schedule appointment', {
          description: errorMsg,
        });
        console.error('❌ Appointment creation failed:', errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error('Error creating appointment', {
        description: errorMsg,
      });
      console.error('❌ Exception during appointment creation:', error);
    }
  };

  const handleClearAllAppointments = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete ALL appointments? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      console.log('🗑️ Clearing all appointments...');
      const response = await api.clearAllAppointments();
      
      if (response?.success) {
        toast.success('All appointments cleared successfully!', {
          description: `Deleted ${response.deletedAppointments} appointments`,
        });
        console.log('✅ Appointments cleared:', response);
        setAppointments([]);
      } else {
        toast.error('Failed to clear appointments', {
          description: response?.message || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Error clearing appointments:', error);
      toast.error('Failed to clear appointments', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todaysAppointments = appointments.filter((apt) => getAppointmentDateKey(apt) === todayKey);
  const sortedAppointments = sortAppointmentsDesc(todaysAppointments);

  // Filter with fallback for both old and new field names
  const filteredAppointments = sortedAppointments.filter((apt) => {
    const patientName = apt.patientName || apt.patient || 'Unknown';
    const mrNo = String(apt.mrNo || apt.patientNo || '');
    const searchLower = searchQuery.toLowerCase();
    return (
      patientName.toLowerCase().includes(searchLower) ||
      mrNo.toLowerCase().includes(searchLower)
    );
  });

  const patientOptions = patients
    .filter((p) => {
      if (!patientSearch.trim()) return false;
      const q = patientSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.mrNo || '').toLowerCase().includes(q) ||
        (p.forceNo || '').toLowerCase().includes(q)
      );
    })
    .slice(0, 25);
  
  console.log('🔍 Filter Debug:', {
    totalAppointments: sortedAppointments.length,
    filteredCount: filteredAppointments.length,
    searchQuery,
    firstAppointmentKeys: appointments[0] ? Object.keys(appointments[0]) : 'none',
  });

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
            <h2 className="text-2xl font-bold text-foreground">Appointments</h2>
            <p className="text-muted-foreground">Schedule and manage patient appointments</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Patient <span className="text-destructive">*</span></Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={patients.length === 0 ? 'No patients registered' : 'Search by name, MR No, or Force No'}
                        className="pl-10"
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setSelectedPatientId('');
                          setNewPatientName('');
                        }}
                        disabled={patients.length === 0}
                      />
                    </div>
                    {patients.length > 0 && patientSearch.trim().length > 0 && (
                      <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
                        {patientOptions.length === 0 ? (
                          <p className="p-3 text-sm text-muted-foreground">No matches</p>
                        ) : (
                          patientOptions.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              className={`w-full text-left px-3 py-2 hover:bg-muted ${selectedPatientId === patient.id ? 'bg-muted' : ''}`}
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setNewPatientName(patient.name);
                                setPatientSearch(`${patient.name} (${patient.mrNo || 'N/A'}${patient.forceNo ? ` | Force ${patient.forceNo}` : ''})`);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">{patient.name}</p>
                                  <p className="text-xs text-muted-foreground">MR: {patient.mrNo || 'N/A'}{patient.forceNo ? ` • Force: ${patient.forceNo}` : ''}</p>
                                </div>
                                {selectedPatientId === patient.id && <Badge variant="secondary">Selected</Badge>}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Doctor <span className="text-destructive">*</span></Label>
                  <Select
                    value={newDoctorId}
                    onValueChange={(value) => {
                      setNewDoctorId(value);
                      const doctor = doctors.find((doc) => doc.id === value);
                      setNewRoomNo(doctor?.roomNo ? String(doctor.roomNo) : '');
                    }}
                    disabled={doctors.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={doctors.length === 0 ? "No doctors available" : "Select doctor"} />
                    </SelectTrigger>
                    {doctors.length > 0 && (
                      <SelectContent>
                        {doctors.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name} {doc.department ? `- ${doc.department}` : ''} {doc.roomNo ? `(Room ${doc.roomNo})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consultation Room <span className="text-destructive">*</span></Label>
                  <Select
                    value={assignedRoomNo || newRoomNo}
                    onValueChange={setNewRoomNo}
                    disabled={!!assignedRoomNo}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room number" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedRooms.map((room) => (
                        <SelectItem key={room} value={room}>{`Room ${room}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {assignedRoomNo && (
                    <p className="text-xs text-muted-foreground">Room is locked to the doctor&apos;s assignment.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => d && setSelectedDate(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAppointment}>
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleClearAllAppointments}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
            </div>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Appointments</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or MR No"
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
                  <TableHead>Token</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MR No</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      {sortedAppointments.length === 0 ? 'No appointments found for today' : 'No results match your search'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((apt) => {
                    // Handle both old and new field names
                    const patientName = apt.patientName || apt.patient || 'Unknown';
                    const mrNo = apt.mrNo || apt.patientNo || '-';
                    const doctor = apt.doctor || apt.doctorName || 'Unknown';
                    const roomNo = apt.roomNo || '1';
                    
                    return (
                      <TableRow key={apt.id || apt._id}>
                        <TableCell>
                          <Badge className="font-mono bg-blue-100 text-blue-900">{apt.token || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{patientName}</TableCell>
                        <TableCell>{mrNo}</TableCell>
                        <TableCell>{doctor}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{roomNo}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {/* Print Token */}
                            {apt.token && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Print Token"
                                onClick={() => {
                                  setSelectedToken({
                                    tokenNo: apt.token,
                                    patientName: patientName,
                                    mrNo: mrNo !== '-' ? mrNo : '',
                                    department: apt.department || 'OPD',
                                    doctor: doctor,
                                    date: format(new Date(), 'dd/MM/yyyy'),
                                    time: apt.time || format(new Date(), 'hh:mm a'),
                                    type: 'OPD' as const,
                                  });
                                  setIsTokenSheetOpen(true);
                                }}
                              >
                                <Printer className="w-4 h-4 text-primary" />
                              </Button>
                            )}
                            {apt.status === 'scheduled' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Mark Complete"
                                  onClick={() => handleUpdateAppointmentStatus(apt.id || apt._id, 'completed')}
                                >
                                  <CheckCircle className="w-4 h-4 text-success" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Cancel"
                                  onClick={() => handleUpdateAppointmentStatus(apt.id || apt._id, 'cancelled')}
                                >
                                  <XCircle className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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

export default AppointmentsPage;
