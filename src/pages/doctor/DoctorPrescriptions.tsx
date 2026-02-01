import React, { useState } from 'react';
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
  Search,
  Eye,
  Printer,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const mockPrescriptions = [
  { id: '1', rxNo: 'RX-456789', patientName: 'Muhammad Ali', mrNo: 'MR-001234', date: '2025-02-01', diagnosis: 'Hypertension', medicines: 3, status: 'completed' },
  { id: '2', rxNo: 'RX-456788', patientName: 'Fatima Begum', mrNo: 'MR-001235', date: '2025-02-01', diagnosis: 'Flu', medicines: 4, status: 'pending' },
  { id: '3', rxNo: 'RX-456787', patientName: 'Ahmed Khan', mrNo: 'MR-001236', date: '2025-01-31', diagnosis: 'Back pain', medicines: 2, status: 'completed' },
  { id: '4', rxNo: 'RX-456786', patientName: 'Sara Bibi', mrNo: 'MR-001237', date: '2025-01-31', diagnosis: 'Diabetes Type 2', medicines: 5, status: 'completed' },
];

const DoctorPrescriptions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" /> Dispensed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPrescriptions = mockPrescriptions.filter((rx) =>
    rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.mrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.rxNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Prescriptions</h2>
            <p className="text-muted-foreground">View and manage prescriptions you've written</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Prescription History</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Rx No, Patient, MR No"
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
                  <TableHead>Rx No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>MR No</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell className="font-bold text-primary">{rx.rxNo}</TableCell>
                    <TableCell>{rx.date}</TableCell>
                    <TableCell className="font-medium">{rx.patientName}</TableCell>
                    <TableCell>{rx.mrNo}</TableCell>
                    <TableCell>{rx.diagnosis}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rx.medicines} items</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(rx.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="w-4 h-4" />
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

export default DoctorPrescriptions;
