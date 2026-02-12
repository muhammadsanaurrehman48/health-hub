import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSearchParams } from 'react-router-dom';
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
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  Search,
  Activity,
  Heart,
  Thermometer,
  Clock,
  User,
  Save,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const NurseVitals: React.FC = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Dynamic data states
  const [patients, setPatients] = useState<any[]>([]);
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Vitals form
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch data - Get OPD appointments waiting for vitals
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch scheduled appointments (OPD patients waiting for vitals)
      const appointmentsRes = await api.getAppointments().catch(() => ({ success: false, data: [] }));

      if (appointmentsRes.success && appointmentsRes.data) {
        // Filter only scheduled appointments (waiting for consultation/vitals) — exclude vitals_recorded
        const scheduledAppointments = (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [])
          .filter((apt: any) => apt.status === 'scheduled' || apt.status === 'waiting')
          .map((apt: any) => {
            // Extract ID from patientId (could be string or object)
            let patientIdValue = apt.patientId;
            if (typeof patientIdValue === 'object' && patientIdValue?._id) {
              patientIdValue = patientIdValue._id; // Extract just the ID if it's populated
            }
            
            return {
              id: patientIdValue, // Use just the ID string
              appointmentId: apt.id || apt._id,
              name: apt.patientName || 'Unknown',
              mrNo: apt.mrNo || apt.patientNo || '',
              ward: 'OPD',
              bed: `Room ${apt.roomNo}`,
              admitDate: apt.date ? new Date(apt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              doctor: apt.doctor || apt.doctorName || 'Assigned Doctor',
              roomNo: apt.roomNo,
              token: apt.token || 'N/A',
              appointmentNo: apt.appointmentNo,
            };
          });
        
        console.log('🏥 [NURSE] Loaded', scheduledAppointments.length, 'OPD appointments waiting for vitals');
        setPatients(scheduledAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchVitalsHistory = useCallback(async (patientId: string) => {
    try {
      const response = await api.getPatientVitals(patientId).catch(() => ({ success: false, data: [] }));
      if (response.success && response.data) {
        const vitals = (Array.isArray(response.data) ? response.data : []).map((v: any) => ({
          id: v._id || v.id,
          time: v.recordedAt ? new Date(v.recordedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          bp: v.bloodPressure || '-',
          pulse: v.pulse || '-',
          temp: v.temperature ? v.temperature + '°F' : '-',
          spo2: v.spo2 ? v.spo2 + '%' : '-',
          recordedBy: v.recordedBy?.name || v.nurseName || 'Nurse',
        }));
        setVitalsHistory(vitals.slice(0, 10)); // Last 10 records
      }
    } catch (error) {
      console.error('Error fetching vitals history:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedPatient?.id) {
      // Ensure patientId is a string before fetching
      let pid = selectedPatient.id;
      if (typeof pid === 'object' && pid !== null) {
        pid = pid._id || pid.id || String(pid);
      }
      fetchVitalsHistory(pid);
    }
  }, [selectedPatient, fetchVitalsHistory]);

  // Handle appointment ID parameter from dashboard
  useEffect(() => {
    if (appointmentId && patients.length > 0) {
      const fetchAppointmentDetails = async () => {
        try {
          const response = await api.request(`/appointments/${appointmentId}`);
          if (response.success && response.data) {
            const apt = response.data;
            // Extract patientId - could be string or populated object
            let extractedPatientId = apt.patientId;
            if (typeof extractedPatientId === 'object' && extractedPatientId !== null) {
              extractedPatientId = extractedPatientId._id || extractedPatientId.id || String(extractedPatientId);
            }
            // Pre-select patient from appointment
            const patient = patients.find(p => 
              p.id === extractedPatientId || p.mrNo === apt.mrNo
            ) || {
              id: extractedPatientId,
              name: apt.patientName || (apt.patientId?.firstName ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : 'Unknown'),
              mrNo: apt.mrNo || apt.patientNo || apt.patientId?.patientNo || '',
              ward: 'OPD',
              bed: 'Consultation',
              doctor: apt.doctor || 'Assigned Doctor',
            };
            setSelectedPatient(patient);
            console.log('✅ Auto-selected patient from appointment:', patient.name, 'ID:', patient.id);
          }
        } catch (error) {
          console.error('Error fetching appointment details:', error);
        }
      };
      fetchAppointmentDetails();
    }
  }, [appointmentId, patients]);

  const handleRefresh = () => fetchData(true);

  const handleSaveVitals = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    try {
      setSaving(true);
      
      // Get appointmentId from URL param OR from selectedPatient
      const aptId = appointmentId || selectedPatient.appointmentId;
      
      // Ensure patientId is always a string
      let patientIdStr = selectedPatient.id;
      if (typeof patientIdStr === 'object' && patientIdStr !== null) {
        patientIdStr = patientIdStr._id || patientIdStr.id || String(patientIdStr);
      }
      
      console.log('📝 [NURSE] Saving vitals for patient:', {
        patientId: patientIdStr,
        appointmentId: aptId,
        bloodPressure,
        pulse,
        temperature,
        spo2,
      });
      
      const response = await api.recordVitals({
        patientId: patientIdStr,
        appointmentId: aptId || undefined,
        bloodPressure,
        pulse: pulse ? parseInt(pulse) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        spo2: spo2 ? parseInt(spo2) : undefined,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
        notes,
        recordedAt: new Date().toISOString(),
      });
      
      console.log('✅ [NURSE] Vitals saved successfully:', response);
      toast.success(`Vitals recorded for ${selectedPatient.name}${aptId ? ' - Doctor notified' : ''}`);
      
      // Remove the patient from the pending list since vitals are now recorded
      setPatients(prev => prev.filter(p => p.appointmentId !== aptId && p.id !== patientIdStr));
      
      // Clear form and selection
      setSelectedPatient(null);
      setBloodPressure('');
      setPulse('');
      setTemperature('');
      setSpo2('');
      setRespiratoryRate('');
      setNotes('');
      setVitalsHistory([]);
    } catch (error: any) {
      console.error('❌ [NURSE] Error saving vitals:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save vitals';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout requiredRole="nurse">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="nurse">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patient Vitals</h2>
            <p className="text-muted-foreground">Record and monitor patient vital signs</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">OPD Appointments</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredPatients.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No patients with scheduled appointments</p>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPatient?.id === patient.id
                        ? 'bg-primary/10 border-primary border'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.mrNo}</p>
                      </div>
                      {patient.token && patient.token !== 'N/A' && (
                        <Badge className="bg-blue-600 text-white font-mono">{patient.token}</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">{patient.bed}</Badge>
                      <Badge variant="secondary" className="text-xs">{patient.doctor}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Vitals Entry */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Record Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div className="space-y-6">
                  {/* Selected Patient Info */}
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{selectedPatient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          MR: {selectedPatient.mrNo} | {selectedPatient.bed}
                        </p>
                      </div>
                      <div className="text-right">
                        {selectedPatient.token && selectedPatient.token !== 'N/A' && (
                          <Badge className="bg-blue-600 text-white font-mono text-lg px-3">{selectedPatient.token}</Badge>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">{selectedPatient.doctor}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Form */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-destructive" />
                        Blood Pressure (mmHg)
                      </Label>
                      <Input
                        placeholder="120/80"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Pulse (bpm)
                      </Label>
                      <Input
                        placeholder="72"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-warning" />
                        Temperature (°F)
                      </Label>
                      <Input
                        placeholder="98.6"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SpO2 (%)</Label>
                      <Input
                        placeholder="98"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Respiratory Rate (/min)</Label>
                      <Input
                        placeholder="16"
                        value={respiratoryRate}
                        onChange={(e) => setRespiratoryRate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        defaultValue={new Date().toTimeString().slice(0, 5)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes / Observations</Label>
                    <Textarea
                      placeholder="Any observations or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSaveVitals} className="w-full" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Vitals'}
                  </Button>

                  {/* Previous Vitals */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Vitals History</h4>
                    {vitalsHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-4">No vital records yet</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>BP</TableHead>
                            <TableHead>Pulse</TableHead>
                            <TableHead>Temp</TableHead>
                            <TableHead>SpO2</TableHead>
                            <TableHead>Recorded By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vitalsHistory.map((vital) => (
                            <TableRow key={vital.id}>
                              <TableCell>{vital.time}</TableCell>
                              <TableCell>{vital.bp}</TableCell>
                              <TableCell>{vital.pulse}</TableCell>
                              <TableCell>{vital.temp}</TableCell>
                              <TableCell>{vital.spo2}</TableCell>
                              <TableCell>{vital.recordedBy}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a patient from the list to record vitals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NurseVitals;
