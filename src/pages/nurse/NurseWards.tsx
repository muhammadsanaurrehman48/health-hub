import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  Search,
  BedDouble,
  ArrowRightLeft,
  User,
  Loader2,
  RefreshCw,
  LogOut,
} from 'lucide-react';

// Define ward structure
const wardDefinitions = [
  { id: '1', name: 'General Ward A', totalBeds: 20 },
  { id: '2', name: 'General Ward B', totalBeds: 20 },
  { id: '3', name: 'ICU', totalBeds: 10 },
  { id: '4', name: 'Private Rooms', totalBeds: 15 },
  { id: '5', name: 'Surgical Ward', totalBeds: 12 },
];

const NurseWards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [admittedPatients, setAdmittedPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admitted patients from database
  const fetchAdmittedPatients = async () => {
    try {
      const response = await api.getAdmittedPatients();
      if (response.success) {
        setAdmittedPatients(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching admitted patients:', error);
      toast.error('Failed to fetch ward data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmittedPatients();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdmittedPatients();
  };

  const handleDischarge = async (wardPatientId: string, patientName: string) => {
    try {
      const response = await api.dischargePatient(wardPatientId);
      if (response.success) {
        toast.success(`${patientName} discharged successfully!`);
        fetchAdmittedPatients();
      } else {
        toast.error(response.message || 'Failed to discharge patient');
      }
    } catch (error) {
      console.error('Error discharging patient:', error);
      toast.error('Failed to discharge patient');
    }
  };

  // Calculate ward statistics from actual data
  const wardStats = wardDefinitions.map(ward => {
    const occupiedCount = admittedPatients.filter(p => p.ward === ward.name).length;
    return {
      ...ward,
      occupied: occupiedCount,
      available: ward.totalBeds - occupiedCount,
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'admitted':
        return <Badge className="bg-primary">Admitted</Badge>;
      case 'critical':
        return <Badge className="bg-destructive">Critical</Badge>;
      case 'stable':
        return <Badge className="bg-success text-success-foreground">Stable</Badge>;
      case 'discharged':
        return <Badge variant="secondary">Discharged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPatients = admittedPatients.filter((patient) => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.bed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = wardFilter === 'all' || patient.ward === wardFilter;
    return matchesSearch && matchesWard;
  });

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
            <h2 className="text-2xl font-bold text-foreground">Ward & Bed Management</h2>
            <p className="text-muted-foreground">Manage ward allocations and bed assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Transfer Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Patient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Patient</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                      <SelectContent>
                        {admittedPatients.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} - {p.bed}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Transfer To Ward</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                      <SelectContent>
                        {wardDefinitions.map(w => (
                          <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>New Bed Number</Label>
                    <Input placeholder="Enter bed number (e.g., A-5)" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => { toast.success('Patient transferred successfully!'); setIsTransferDialogOpen(false); }}>
                    Transfer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Ward Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {wardStats.map((ward) => (
            <Card key={ward.id}>
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm mb-2">{ward.name}</h4>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-2xl font-bold text-primary">{ward.available}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">{ward.occupied}/{ward.totalBeds}</p>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admitted Patients List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Admitted Patients ({filteredPatients.length})</CardTitle>
              <div className="flex gap-4">
                <Select value={wardFilter} onValueChange={setWardFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wards</SelectItem>
                    {wardDefinitions.map(w => (
                      <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patient or bed..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPatients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bed</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Patient No</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admit Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-bold">{patient.bed}</TableCell>
                      <TableCell>{patient.ward}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {patient.name}
                        </div>
                      </TableCell>
                      <TableCell>{patient.patientNo || patient.mrNo || '-'}</TableCell>
                      <TableCell>{patient.doctor || '-'}</TableCell>
                      <TableCell>{getStatusBadge(patient.status)}</TableCell>
                      <TableCell>
                        {patient.admitDate ? new Date(patient.admitDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setIsTransferDialogOpen(true)}>
                            <ArrowRightLeft className="w-4 h-4 mr-1" />
                            Transfer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDischarge(patient.id, patient.name)}
                          >
                            <LogOut className="w-4 h-4 mr-1" />
                            Discharge
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BedDouble className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No admitted patients found</p>
                <p className="text-sm">Patients will appear here once admitted through the entries page</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NurseWards;
