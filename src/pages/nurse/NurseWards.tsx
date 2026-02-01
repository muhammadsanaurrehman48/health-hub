import React, { useState } from 'react';
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
import {
  Search,
  BedDouble,
  Plus,
  Edit,
  ArrowRightLeft,
  CheckCircle,
  User,
} from 'lucide-react';

const mockWards = [
  { id: '1', name: 'General Ward A', totalBeds: 20, occupied: 15, available: 5 },
  { id: '2', name: 'General Ward B', totalBeds: 20, occupied: 18, available: 2 },
  { id: '3', name: 'ICU', totalBeds: 10, occupied: 8, available: 2 },
  { id: '4', name: 'Private Rooms', totalBeds: 15, occupied: 10, available: 5 },
  { id: '5', name: 'Surgical Ward', totalBeds: 12, occupied: 9, available: 3 },
];

const mockBeds = [
  { id: '1', bedNo: 'A-1', ward: 'General Ward A', status: 'occupied', patient: 'Muhammad Ali', mrNo: 'MR-001234' },
  { id: '2', bedNo: 'A-2', ward: 'General Ward A', status: 'available', patient: null, mrNo: null },
  { id: '3', bedNo: 'A-3', ward: 'General Ward A', status: 'occupied', patient: 'Fatima Begum', mrNo: 'MR-001235' },
  { id: '4', bedNo: 'ICU-1', ward: 'ICU', status: 'occupied', patient: 'Usman Ali', mrNo: 'MR-001238' },
  { id: '5', bedNo: 'ICU-2', ward: 'ICU', status: 'maintenance', patient: null, mrNo: null },
  { id: '6', bedNo: 'P-1', ward: 'Private Rooms', status: 'available', patient: null, mrNo: null },
];

const NurseWards: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'occupied':
        return <Badge className="bg-primary">Occupied</Badge>;
      case 'available':
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case 'maintenance':
        return <Badge className="bg-warning text-warning-foreground">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredBeds = mockBeds.filter((bed) => {
    const matchesSearch = bed.bedNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bed.patient?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesWard = wardFilter === 'all' || bed.ward === wardFilter;
    return matchesSearch && matchesWard;
  });

  return (
    <DashboardLayout requiredRole="nurse">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Ward & Bed Management</h2>
            <p className="text-muted-foreground">Manage ward allocations and bed assignments</p>
          </div>
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
                  <Label>Patient MR No</Label>
                  <Input placeholder="Enter MR No" />
                </div>
                <div className="space-y-2">
                  <Label>Current Bed</Label>
                  <Input disabled value="A-1 (General Ward A)" />
                </div>
                <div className="space-y-2">
                  <Label>Transfer To Ward</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                    <SelectContent>
                      {mockWards.map(w => (
                        <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transfer To Bed</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select available bed" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A-2">A-2</SelectItem>
                      <SelectItem value="P-1">P-1</SelectItem>
                    </SelectContent>
                  </Select>
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

        {/* Ward Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {mockWards.map((ward) => (
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

        {/* Bed List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bed Allocation</CardTitle>
              <div className="flex gap-4">
                <Select value={wardFilter} onValueChange={setWardFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wards</SelectItem>
                    {mockWards.map(w => (
                      <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bed or patient..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed No</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MR No</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBeds.map((bed) => (
                  <TableRow key={bed.id}>
                    <TableCell className="font-bold">{bed.bedNo}</TableCell>
                    <TableCell>{bed.ward}</TableCell>
                    <TableCell>{getStatusBadge(bed.status)}</TableCell>
                    <TableCell>
                      {bed.patient ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {bed.patient}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{bed.mrNo || '-'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {bed.status === 'available' && (
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        )}
                        {bed.status === 'occupied' && (
                          <Button size="sm" variant="outline">
                            <ArrowRightLeft className="w-4 h-4 mr-1" />
                            Transfer
                          </Button>
                        )}
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

export default NurseWards;
