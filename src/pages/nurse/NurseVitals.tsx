import React, { useState, useEffect, useCallback } from 'react';
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

  // Fetch data
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const patientsRes = await api.getAdmittedPatients().catch(() => ({ success: false, data: [] }));

      if (patientsRes.success && patientsRes.data) {
        const patientList = (Array.isArray(patientsRes.data) ? patientsRes.data : []).map((p: any) => ({
          id: p._id || p.id,
          name: p.name || p.patientName || 'Unknown',
          mrNo: p.mrNo || p.patientNo || '',
          ward: p.ward || 'General Ward',
          bed: p.bed || 'Unassigned',
          admitDate: p.admitDate ? new Date(p.admitDate).toISOString().split('T')[0] : '',
          doctor: p.doctor?.name || p.doctorName || 'Assigned Doctor',
        }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
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
      fetchVitalsHistory(selectedPatient.id);
    }
  }, [selectedPatient, fetchVitalsHistory]);

  const handleRefresh = () => fetchData(true);

  const handleSaveVitals = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    try {
      setSaving(true);
      await api.recordVitals({
        patientId: selectedPatient.id,
        bloodPressure,
        pulse: pulse ? parseInt(pulse) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        spo2: spo2 ? parseInt(spo2) : undefined,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
        notes,
        recordedAt: new Date().toISOString(),
      });
      toast.success(`Vitals recorded for ${selectedPatient.name}`);
      setBloodPressure('');
      setPulse('');
      setTemperature('');
      setSpo2('');
      setRespiratoryRate('');
      setNotes('');
      fetchVitalsHistory(selectedPatient.id); // Refresh history
    } catch (error) {
      console.error('Error saving vitals:', error);
      toast.error('Failed to save vitals');
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
              <CardTitle className="text-lg">Admitted Patients</CardTitle>
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
                <p className="text-center text-muted-foreground py-4">No patients found</p>
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
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.mrNo}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs">{patient.ward}</Badge>
                      <Badge variant="outline" className="text-xs">Bed: {patient.bed}</Badge>
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
                          {selectedPatient.mrNo} | {selectedPatient.ward} - Bed {selectedPatient.bed}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Attending Doctor</p>
                        <p className="font-medium">{selectedPatient.doctor}</p>
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
