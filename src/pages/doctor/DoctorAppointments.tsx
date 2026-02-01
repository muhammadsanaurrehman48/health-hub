import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Search,
  PlayCircle,
  CheckCircle,
  FileText,
  Pill,
} from 'lucide-react';

const mockAppointments = [
  { id: '1', patientName: 'Muhammad Ali', mrNo: 'MR-001234', forceNo: 'F-12345', age: 45, gender: 'Male', time: '10:00 AM', complaint: 'Chest pain', status: 'waiting' },
  { id: '2', patientName: 'Fatima Begum', mrNo: 'MR-001235', forceNo: 'F-12346', age: 32, gender: 'Female', time: '10:30 AM', complaint: 'Fever', status: 'in-progress' },
  { id: '3', patientName: 'Ahmed Khan', mrNo: 'MR-001236', forceNo: 'F-12347', age: 28, gender: 'Male', time: '11:00 AM', complaint: 'Back pain', status: 'completed' },
  { id: '4', patientName: 'Sara Bibi', mrNo: 'MR-001237', forceNo: 'F-12348', age: 55, gender: 'Female', time: '11:30 AM', complaint: 'Diabetes checkup', status: 'waiting' },
  { id: '5', patientName: 'Usman Ali', mrNo: 'MR-001238', forceNo: 'F-12349', age: 40, gender: 'Male', time: '12:00 PM', complaint: 'Hypertension', status: 'waiting' },
];

const DoctorAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      waiting: 'bg-warning text-warning-foreground',
      'in-progress': 'bg-primary',
      completed: 'bg-success text-success-foreground',
    };
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>;
  };

  const filteredAppointments = mockAppointments.filter((apt) =>
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.mrNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startConsultation = (appointment: typeof mockAppointments[0]) => {
    navigate(`/doctor/consultation/${appointment.mrNo}`, { state: { patient: appointment } });
  };

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Today's Appointments</h2>
            <p className="text-muted-foreground">Manage your scheduled consultations</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'waiting').length}</p>
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
                  <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'in-progress').length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
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
                  <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'completed').length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patient Queue</CardTitle>
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
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MR No / Force No</TableHead>
                  <TableHead>Age / Gender</TableHead>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {apt.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{apt.patientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{apt.mrNo}</p>
                        <p className="text-xs text-muted-foreground">{apt.forceNo}</p>
                      </div>
                    </TableCell>
                    <TableCell>{apt.age}y / {apt.gender}</TableCell>
                    <TableCell>{apt.complaint}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {apt.status !== 'completed' && (
                          <Button size="sm" onClick={() => startConsultation(apt)}>
                            <PlayCircle className="w-4 h-4 mr-1" />
                            {apt.status === 'in-progress' ? 'Continue' : 'Start'}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          History
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
