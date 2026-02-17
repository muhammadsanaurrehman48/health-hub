import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import api from '@/utils/api';
import {
  Search,
  User,
  Calendar,
  FileText,
  Activity,
  Pill,
  Beaker,
  Scan,
  ArrowLeft,
  Loader2,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DoctorPatientHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Patient dropdown state
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [patientSearchInput, setPatientSearchInput] = useState('');

  // Fetch all patients for dropdown
  useEffect(() => {
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
          bloodGroup: p.bloodGroup || '',
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
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient({
        mrNo: patient.mrNo || patient.forceNo || 'N/A',
        name: patient.name,
        age: patient.age || '-',
        gender: patient.gender || 'N/A',
        bloodGroup: patient.bloodGroup || 'N/A',
        phone: patient.phone || 'Not available',
        _id: patient.id,
      });
      fetchPatientHistory(patient.id);
    }
    setPatientSearchOpen(false);
  };

  // Get patient from route state if passed from queue
  useEffect(() => {
    if (location.state?.patient) {
      const p = location.state.patient;
      setSelectedPatient({
        mrNo: p.forceNo || p.mrNo || 'N/A',
        name: p.patientName || p.name,
        age: p.age || 30,
        gender: p.gender || 'N/A',
        bloodGroup: p.bloodGroup || 'N/A',
        phone: p.phone || 'Not available',
        _id: p._id || p.patientId,
      });
      // Fetch history for this patient
      if (p._id || p.patientId) {
        fetchPatientHistory(p._id || p.patientId);
      }
    }
  }, [location.state]);

  const fetchPatientHistory = async (patientId: string) => {
    setLoading(true);
    try {
      const [prescRes, labRes, radRes] = await Promise.all([
        api.getPatientPrescriptions(patientId),
        api.getLabRequests(),
        api.getRadiologyRequests()
      ]);
      
      const history: any[] = [];
      
      // Add prescriptions to history
      if (prescRes.success && prescRes.data) {
        prescRes.data.forEach((p: any) => {
          const doctorName = p.doctorId?.name || p.doctor?.name || p.doctor || 'Doctor';
          history.push({
            id: p._id,
            date: p.createdAt ? p.createdAt.split('T')[0] : (p.date || '-'),
            type: 'OPD Visit',
            doctor: doctorName,
            diagnosis: p.diagnosis || '-',
            prescription: p.rxNo || '-',
            medicines: p.medicines || [],
            labTests: p.labTests || [],
            radiologyTests: p.radiologyTests || [],
            notes: p.notes || '-',
            status: p.status || 'pending',
          });
        });
      }
      
      // Filter labs by patient
      if (labRes.success && labRes.data) {
        labRes.data
          .filter((l: any) => {
            const pid = l.patientId && l.patientId._id ? l.patientId._id : l.patientId;
            return pid?.toString?.() === patientId?.toString?.();
          })
          .forEach((l: any) => {
            history.push({
              id: l._id || l.id,
              date: l.requestDate || l.date || l.createdAt?.split('T')[0],
              type: 'Lab Report',
              doctor: l.doctor || '-',
              diagnosis: l.test || l.testName || '-',
              prescription: l.requestNo || '-',
              notes: typeof l.result === 'string' ? l.result : (l.result ? JSON.stringify(l.result) : '-'),
              status: l.status || 'pending',
            });
          });
      }
      
      // Filter radiology by patient
      if (radRes.success && radRes.data) {
        radRes.data
          .filter((r: any) => {
            const pid = r.patientId && r.patientId._id ? r.patientId._id : r.patientId;
            return pid?.toString?.() === patientId?.toString?.();
          })
          .forEach((r: any) => {
            const report = r.report || {};
            const findings = report.findings || '';
            const impression = report.impression || '';
            const notesText = [findings, impression].filter(Boolean).join(' | ') || '-';
            history.push({
              id: r._id || r.id,
              date: r.requestDate || r.createdAt?.split('T')[0],
              type: 'Radiology',
              doctor: r.doctor || '-',
              diagnosis: r.test || r.testType || '-',
              prescription: r.requestNo || '-',
              notes: notesText,
              status: r.status || 'pending',
            });
          });
      }
      
      // Sort by date descending
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPatientHistory(history);
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await api.searchPatients(searchQuery);
      if (response.success && response.data?.length > 0) {
        const p = response.data[0];
        setSelectedPatient({
          mrNo: p.mrNo || p.patientNo || 'N/A',
          name: p.name,
          age: p.age || '-',
          gender: p.gender || 'N/A',
          bloodGroup: p.bloodGroup || 'N/A',
          phone: p.phone || 'Not available',
          _id: p._id,
        });
        fetchPatientHistory(p._id);
      } else {
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      setSelectedPatient(null);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patient Medical History</h2>
            <p className="text-muted-foreground">View complete medical records of patients</p>
          </div>
          {selectedPatient && location.state?.patient && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedPatient(null);
                navigate(-1);
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Queue
            </Button>
          )}
        </div>

        {/* Search - Only show if no patient passed via route state */}
        {!location.state?.patient && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search & Select Patient</label>
                  <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={patientSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedPatient
                          ? `${selectedPatient.name} - ${selectedPatient.mrNo}`
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
                          <CommandEmpty>No patient found.</CommandEmpty>
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
                                    selectedPatient?._id === patient.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{patient.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {patient.mrNo && `MR: ${patient.mrNo}`}
                                    {patient.forceNo && ` | Force: ${patient.forceNo}`}
                                    {patient.age && ` | Age: ${patient.age}`}
                                    {patient.gender && ` | ${patient.gender}`}
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
                    Start typing to filter patients from the database
                  </p>
                </div>
                
                {/* Alternative: Manual Search */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Or search by MR No or Patient Name..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedPatient && (
          <>
            {/* Patient Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{selectedPatient.name}</h3>
                      <p className="text-muted-foreground">
                        {selectedPatient.mrNo} | {selectedPatient.age}y / {selectedPatient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Blood Group</p>
                      <Badge variant="outline" className="mt-1">{selectedPatient.bloodGroup}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Total Visits</p>
                      <p className="font-bold text-primary text-lg">{patientHistory.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Records */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  <FileText className="w-4 h-4 mr-2" />
                  All Records
                </TabsTrigger>
                <TabsTrigger value="visits">
                  <Calendar className="w-4 h-4 mr-2" />
                  OPD Visits
                </TabsTrigger>
                <TabsTrigger value="lab">
                  <Beaker className="w-4 h-4 mr-2" />
                  Lab Reports
                </TabsTrigger>
                <TabsTrigger value="radiology">
                  <Scan className="w-4 h-4 mr-2" />
                  Radiology
                </TabsTrigger>
                <TabsTrigger value="prescriptions">
                  <Pill className="w-4 h-4 mr-2" />
                  Prescriptions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : patientHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Diagnosis / Report</TableHead>
                          <TableHead>Prescription</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {record.date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.type}</Badge>
                            </TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell className="font-medium">{record.diagnosis}</TableCell>
                            <TableCell>
                              {record.prescription !== '-' ? (
                                <Button variant="link" className="p-0 h-auto text-primary">
                                  {record.prescription}
                                </Button>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                              {record.notes}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No medical history found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visits">
                <Card>
                  <CardHeader><CardTitle>OPD Visits</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : patientHistory.filter(r => r.type === 'OPD Visit').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Rx No</TableHead>
                          <TableHead>Medicines</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientHistory.filter(r => r.type === 'OPD Visit').map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell className="font-medium">{record.diagnosis}</TableCell>
                            <TableCell className="text-primary font-semibold">{record.prescription}</TableCell>
                            <TableCell>
                              {record.medicines?.length > 0 ? (
                                <div className="text-sm">
                                  {record.medicines.map((m: any, i: number) => (
                                    <span key={i}>{m.name}{m.dosage ? ` (${m.dosage})` : ''}{i < record.medicines.length - 1 ? ', ' : ''}</span>
                                  ))}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell><Badge variant="outline">{record.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No OPD visits found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lab">
                <Card>
                  <CardHeader><CardTitle>Lab Reports</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : patientHistory.filter(r => r.type === 'Lab Report').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Test</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Result / Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientHistory.filter(r => r.type === 'Lab Report').map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell className="font-medium">{record.diagnosis}</TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell>{record.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No lab reports found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="radiology">
                <Card>
                  <CardHeader><CardTitle>Radiology Reports</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : patientHistory.filter(r => r.type === 'Radiology').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Test</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Findings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientHistory.filter(r => r.type === 'Radiology').map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell className="font-medium">{record.diagnosis}</TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell>{record.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No radiology reports found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescriptions">
                <Card>
                  <CardHeader><CardTitle>Prescriptions</CardTitle></CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : patientHistory.filter(r => r.type === 'OPD Visit').length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Rx No</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Medicines</TableHead>
                          <TableHead>Lab Tests</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientHistory.filter(r => r.type === 'OPD Visit').map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell className="text-primary font-semibold">{record.prescription}</TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell className="font-medium">{record.diagnosis}</TableCell>
                            <TableCell>
                              {record.medicines?.length > 0 ? (
                                <Badge variant="outline">{record.medicines.length} items</Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {record.labTests?.length > 0 ? (
                                <Badge variant="outline">{record.labTests.join(', ')}</Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell><Badge variant="outline">{record.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No prescriptions found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!selectedPatient && searchQuery && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No patient found with the given search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatientHistory;
