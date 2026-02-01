import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
} from 'lucide-react';

const mockDoctors = [
  { id: '1', name: 'Dr. Ahmad Khan', department: 'Cardiology', slots: 10 },
  { id: '2', name: 'Dr. Sara Ali', department: 'Pediatrics', slots: 8 },
  { id: '3', name: 'Dr. Usman Malik', department: 'Orthopedics', slots: 12 },
  { id: '4', name: 'Dr. Fatima Bibi', department: 'Gynecology', slots: 6 },
];

const mockAppointments = [
  { id: '1', patientName: 'Muhammad Ali', mrNo: 'MR-001234', doctor: 'Dr. Ahmad Khan', department: 'Cardiology', date: '2025-02-01', time: '10:00 AM', status: 'scheduled' },
  { id: '2', patientName: 'Fatima Begum', mrNo: 'MR-001235', doctor: 'Dr. Sara Ali', department: 'Pediatrics', date: '2025-02-01', time: '10:30 AM', status: 'completed' },
  { id: '3', patientName: 'Ahmed Khan', mrNo: 'MR-001236', doctor: 'Dr. Usman Malik', department: 'Orthopedics', date: '2025-02-01', time: '11:00 AM', status: 'cancelled' },
  { id: '4', patientName: 'Sara Bibi', mrNo: 'MR-001237', doctor: 'Dr. Ahmad Khan', department: 'Cardiology', date: '2025-02-01', time: '11:30 AM', status: 'scheduled' },
];

const AppointmentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New appointment form
  const [newMrNo, setNewMrNo] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newTime, setNewTime] = useState('');

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

  const handleCreateAppointment = () => {
    toast.success('Appointment scheduled successfully!');
    setIsDialogOpen(false);
    setNewMrNo('');
    setNewDoctor('');
    setNewTime('');
  };

  const filteredAppointments = mockAppointments.filter((apt) =>
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.mrNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Appointments</h2>
            <p className="text-muted-foreground">Schedule and manage patient appointments</p>
          </div>
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
                  <Label>Patient MR No</Label>
                  <Input
                    placeholder="Enter MR No or search patient"
                    value={newMrNo}
                    onChange={(e) => setNewMrNo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Doctor</Label>
                  <Select value={newDoctor} onValueChange={setNewDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDoctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name} - {doc.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
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
                <div className="space-y-2">
                  <Label>Time Slot</Label>
                  <Select value={newTime} onValueChange={setNewTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        </div>

        {/* Doctor Availability */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockDoctors.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.department}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Available Slots:</span>
                  <Badge variant="outline">{doc.slots}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MR No</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
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
                    <TableCell className="font-medium">{apt.patientName}</TableCell>
                    <TableCell>{apt.mrNo}</TableCell>
                    <TableCell>{apt.doctor}</TableCell>
                    <TableCell>{apt.department}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {apt.status === 'scheduled' && (
                          <>
                            <Button variant="ghost" size="icon" title="Mark Complete">
                              <CheckCircle className="w-4 h-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Cancel">
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;
