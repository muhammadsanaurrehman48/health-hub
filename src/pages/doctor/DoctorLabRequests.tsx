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
  CheckCircle,
  Clock,
  AlertTriangle,
  FlaskConical,
  FileText,
} from 'lucide-react';

const mockLabRequests = [
  { id: '1', requestNo: 'LAB-2025-0123', patientName: 'Muhammad Ali', mrNo: 'MR-001234', test: 'Complete Blood Count', requestDate: '2025-02-01', status: 'completed', result: 'Normal' },
  { id: '2', requestNo: 'LAB-2025-0122', patientName: 'Fatima Begum', mrNo: 'MR-001235', test: 'Blood Sugar Fasting', requestDate: '2025-02-01', status: 'pending', result: '-' },
  { id: '3', requestNo: 'LAB-2025-0121', patientName: 'Ahmed Khan', mrNo: 'MR-001236', test: 'Lipid Profile', requestDate: '2025-01-31', status: 'completed', result: 'Elevated LDL' },
  { id: '4', requestNo: 'LAB-2025-0120', patientName: 'Sara Bibi', mrNo: 'MR-001237', test: 'HbA1c', requestDate: '2025-01-31', status: 'in-progress', result: '-' },
];

const DoctorLabRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary"><FlaskConical className="w-3 h-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRequests = mockLabRequests.filter((req) =>
    req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.mrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requestNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Lab Test Requests</h2>
            <p className="text-muted-foreground">View status of laboratory tests you've requested</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lab Requests</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
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
                      <TableHead>Request No</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR No</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-bold text-primary">{req.requestNo}</TableCell>
                        <TableCell className="font-medium">{req.patientName}</TableCell>
                        <TableCell>{req.mrNo}</TableCell>
                        <TableCell>{req.test}</TableCell>
                        <TableCell>{req.requestDate}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          {req.result !== '-' ? (
                            <span className={req.result === 'Normal' ? 'text-success' : 'text-warning'}>
                              {req.result}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {req.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-1" />
                                View Report
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
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">Pending requests will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">Completed requests will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DoctorLabRequests;
