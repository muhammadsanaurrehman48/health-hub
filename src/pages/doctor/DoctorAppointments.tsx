import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import {
  Calendar,
  Clock,
  User,
  Search,
  PlayCircle,
  CheckCircle,
  FileText,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface QueuePatient {
  tokenNo: string;
  patientName: string;
  patientNo: string;
  forceNo?: string;
  age?: number;
  gender?: string;
  complaint?: string;
  appointmentId?: string;
  status: 'waiting' | 'vitals_recorded' | 'serving' | 'completed' | 'skipped';
  position: number;
}

interface QueueData {
  roomNo: string;
  doctorName: string;
  department: string;
  currentToken: string;
  currentPatient: QueuePatient | null;
  currentPatientIndex: number;
  totalPatients: number;
  waitingPatients: number;
  patients: QueuePatient[];
}

const allowedRooms = ['1', '2', '3', '4'];

const DoctorAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<string[]>(allowedRooms);
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);

  const normalizeRoom = (room: string | number | null | undefined) => (room ? String(room).trim() : '');
  const roomOptions = Array.from(new Set([...allowedRooms, ...availableRooms])).filter(Boolean);

  useEffect(() => {
    const normalizedRoom = normalizeRoom((user as any)?.roomNo);
    if (!selectedRoom && normalizedRoom) {
      setSelectedRoom(normalizedRoom);
      setAutoDetected(true);
    }
  }, [selectedRoom, user?.roomNo]);

  // Auto-detect doctor's room from queue data
  useEffect(() => {
    const detectDoctorRoom = async () => {
      try {
        const response = await api.getAllQueues();
        if (response.success && response.data) {
          const queues = Array.isArray(response.data) ? response.data : [];
          const detectedRooms = queues
            .map((q: any) => normalizeRoom(q.roomNo))
            .filter(Boolean);
          if (detectedRooms.length) {
            setAvailableRooms((prev) => Array.from(new Set([...prev, ...detectedRooms])));
          }

          const doctorName = (user?.name || '').toLowerCase().trim();
          const myQueue = queues.find((q: any) => q.doctorName?.toLowerCase().trim() === doctorName);
          if (myQueue?.roomNo) {
            setSelectedRoom(normalizeRoom(myQueue.roomNo));
            setAutoDetected(true);
          }
        }
      } catch (err) {
        console.error('Error detecting doctor room:', err);
      }
    };
    if (!selectedRoom) {
      detectDoctorRoom();
    }
  }, [user, selectedRoom]);

  // Fetch queue data for selected room
  useEffect(() => {
    const normalizedRoom = normalizeRoom(selectedRoom);
    if (!normalizedRoom) return;

    const fetchQueueData = async () => {
      setLoading(true);
      try {
        console.log('🔄 [Doctor] Fetching queue for room:', normalizedRoom);
        const response = await api.request(`/queue/room/${normalizedRoom}`);
        if (response.success) {
          console.log('✅ [Doctor] Queue fetched:', {
            room: response.data.roomNo,
            doctor: response.data.doctorName,
            total: response.data.totalPatients,
            waiting: response.data.waitingPatients,
            current: response.data.currentPatient?.patientName,
            patients: response.data.patients.map((p: any) => ({ 
              name: p.patientName, 
              token: p.tokenNo, 
              status: p.status 
            })),
          });
          setQueueData(response.data);
          setError(null);
        } else {
          console.error('❌ [Doctor] Failed to fetch queue:', response.message);
          setError(response.message || 'Failed to load queue data');
        }
      } catch (err) {
        console.error('❌ [Doctor] Error fetching queue:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch queue data');
      } finally {
        setLoading(false);
      }
    };

    fetchQueueData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchQueueData, 5000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  const handleRefresh = async () => {
    if (!selectedRoom) return;
    setRefreshing(true);
    try {
      const response = await api.request(`/queue/room/${normalizeRoom(selectedRoom)}`);
      if (response.success) {
        setQueueData(response.data);
        toast.success('Queue data refreshed');
      }
    } catch (err) {
      toast.error('Failed to refresh queue');
    } finally {
      setRefreshing(false);
    }
  };

  const handleMoveToNext = async () => {
    if (!selectedRoom) return;
    try {
      const response = await api.request(`/queue/room/${normalizeRoom(selectedRoom)}/next-patient`, {
        method: 'POST',
      });
      if (response.success) {
        setQueueData(response.data);
        toast.success('Moved to next patient');
      }
    } catch (err) {
      toast.error('Failed to move to next patient');
    }
  };

  const handleCompleteAppointment = async (appointmentId?: string) => {
    if (!selectedRoom || !appointmentId) return;
    try {
      const response = await api.request(`/queue/room/${normalizeRoom(selectedRoom)}/complete-appointment/${appointmentId}`, {
        method: 'POST',
      });
      if (response.success) {
        setQueueData(response.data);
        toast.success('Appointment marked as completed');
      }
    } catch (err) {
      toast.error('Failed to complete appointment');
    }
  };

  const handleStartConsultation = (patient: QueuePatient) => {
    navigate(`/doctor/consultation/${patient.forceNo}`, { 
      state: { 
        patient, 
        room: selectedRoom,
        appointmentId: (patient as any).appointmentId,
        id: (patient as any).appointmentId,
      } 
    });
  };

  const handleViewHistory = (patient: QueuePatient) => {
    navigate(`/doctor/history`, { 
      state: { patient } 
    });
  };

  const sortedPatients = (queueData?.patients || []).slice().sort((a, b) => {
    const tokenA = parseInt(a.tokenNo, 10) || 0;
    const tokenB = parseInt(b.tokenNo, 10) || 0;
    if (tokenB !== tokenA) return tokenB - tokenA;
    return (b.position || 0) - (a.position || 0);
  });

  const filteredPatients = sortedPatients.filter((patient) =>
    patient.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.forceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.tokenNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const waitingCount = filteredPatients.filter(p => p.status === 'waiting').length;
  const servingCount = filteredPatients.filter(p => p.status === 'serving').length;
  const completedCount = filteredPatients.filter(p => p.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      waiting: 'bg-warning text-warning-foreground',
      vitals_recorded: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      serving: 'bg-primary text-primary-foreground',
      completed: 'bg-success text-success-foreground',
      skipped: 'bg-destructive text-destructive-foreground',
    };
    return <Badge className={styles[status] || styles.waiting}>{status}</Badge>;
  };

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Patient Queue</h2>
            <p className="text-muted-foreground">Manage your consultation queue</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Room Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Consultation Room</p>
                <p className="text-2xl font-bold text-primary">
                  {selectedRoom ? `Room ${selectedRoom}` : 'Detecting...'}
                </p>
                {queueData?.doctorName && (
                  <p className="text-sm text-muted-foreground mt-1">{queueData.doctorName} - {queueData.department || 'General'}</p>
                )}
                <div className="mt-3">
                  <Select
                    value={selectedRoom || ''}
                    onValueChange={(value) => {
                      setSelectedRoom(value);
                      setError(null);
                      setAutoDetected(false);
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map((room) => (
                        <SelectItem key={room} value={room}>{`Room ${room}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedRoom && (
                    <p className="text-xs text-muted-foreground mt-1">Pick a room if auto-detect fails.</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground">Assigned room</p>
                  <p className="text-sm font-semibold">
                    {selectedRoom ? `Room ${selectedRoom}` : 'No room assigned (ask admin)'}
                  </p>
                  {autoDetected && !user?.roomNo && selectedRoom && (
                    <p className="text-[11px] text-muted-foreground">Auto-detected from queue</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRefresh}
                  disabled={!selectedRoom || refreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {selectedRoom && queueData && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{waitingCount}</p>
                    <p className="text-sm text-muted-foreground">Waiting</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{servingCount}</p>
                    <p className="text-sm text-muted-foreground">In Service</p>
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
                    <p className="text-2xl font-bold">{completedCount}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{queueData.totalPatients}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Patient Card */}
        {selectedRoom && queueData?.currentPatient && (
          <Card className="border-primary border-2 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Currently Serving</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{queueData.currentPatient.patientName}</p>
                    <p className="text-sm text-muted-foreground">Token: {queueData.currentPatient.tokenNo}</p>
                  </div>
                </div>
                <Button onClick={handleMoveToNext} size="lg" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Complete & Move Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queue Table */}
        {selectedRoom ? (
          loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading queue data...</p>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Queue List - Room {selectedRoom}</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, token or Force No"
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No patients in queue</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead>Token</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Force No</TableHead>
                        <TableHead>Age / Gender</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient, idx) => (
                        <TableRow key={`${patient.tokenNo}-${idx}`}>
                          <TableCell>
                            <Badge variant="outline">{patient.position}</Badge>
                          </TableCell>
                          <TableCell className="font-bold">{patient.tokenNo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <span>{patient.patientName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{patient.forceNo || 'N/A'}</TableCell>
                          <TableCell>{patient.age ? `${patient.age}y / ${patient.gender}` : 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(patient.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {patient.status === 'waiting' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStartConsultation(patient)}
                                    className="gap-1"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    Start
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleCompleteAppointment(patient.appointmentId)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {patient.status === 'vitals_recorded' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStartConsultation(patient)}
                                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    Consult (Vitals Ready)
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleCompleteAppointment(patient.appointmentId)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {patient.status === 'serving' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStartConsultation(patient)}
                                    className="gap-1"
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    Continue
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleCompleteAppointment(patient.appointmentId)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleViewHistory(patient)}
                              >
                                <FileText className="w-4 h-4" />
                                History
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground mb-4">Select a room to view the patient queue</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
