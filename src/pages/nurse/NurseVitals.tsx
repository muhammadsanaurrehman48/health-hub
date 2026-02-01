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
import { toast } from 'sonner';
import {
  Search,
  Activity,
  Heart,
  Thermometer,
  Clock,
  User,
  Save,
} from 'lucide-react';

const mockPatients = [
  { id: '1', name: 'Sara Bibi', mrNo: 'MR-001237', ward: 'General Ward A', bed: 'A-12', admitDate: '2025-01-28', doctor: 'Dr. Ahmad Khan' },
  { id: '2', name: 'Usman Ali', mrNo: 'MR-001238', ward: 'ICU', bed: 'ICU-3', admitDate: '2025-01-30', doctor: 'Dr. Fatima Bibi' },
  { id: '3', name: 'Amina Khatoon', mrNo: 'MR-001239', ward: 'General Ward B', bed: 'B-5', admitDate: '2025-01-31', doctor: 'Dr. Sara Ali' },
];

const NurseVitals: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Vitals form
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveVitals = () => {
    toast.success(`Vitals recorded for ${selectedPatient?.name}`);
    setBloodPressure('');
    setPulse('');
    setTemperature('');
    setSpo2('');
    setRespiratoryRate('');
    setNotes('');
  };

  const filteredPatients = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="nurse">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Vitals</h2>
          <p className="text-muted-foreground">Record and monitor patient vital signs</p>
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
              {filteredPatients.map((patient) => (
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
              ))}
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

                  <Button onClick={handleSaveVitals} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Vitals
                  </Button>

                  {/* Previous Vitals */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Vitals History</h4>
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
                        <TableRow>
                          <TableCell>08:00 AM</TableCell>
                          <TableCell>130/85</TableCell>
                          <TableCell>78</TableCell>
                          <TableCell>99.2°F</TableCell>
                          <TableCell>97%</TableCell>
                          <TableCell>Nurse Ayesha</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>12:00 PM</TableCell>
                          <TableCell>125/82</TableCell>
                          <TableCell>74</TableCell>
                          <TableCell>98.8°F</TableCell>
                          <TableCell>98%</TableCell>
                          <TableCell>Nurse Fatima</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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
