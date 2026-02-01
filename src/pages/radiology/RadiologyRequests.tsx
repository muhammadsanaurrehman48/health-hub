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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Search,
  Scan,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
  Printer,
  Upload,
  Image,
} from 'lucide-react';

const mockRadiologyRequests = [
  { id: '1', requestNo: 'RAD-2025-0056', patientName: 'Muhammad Ali', mrNo: 'MR-001234', forceNo: 'F-12345', test: 'Chest X-Ray PA', doctor: 'Dr. Ahmad Khan', requestDate: '2025-02-01', status: 'pending' },
  { id: '2', requestNo: 'RAD-2025-0055', patientName: 'Fatima Begum', mrNo: 'MR-001235', forceNo: 'F-12346', test: 'Ultrasound Abdomen', doctor: 'Dr. Sara Ali', requestDate: '2025-02-01', status: 'in-progress' },
  { id: '3', requestNo: 'RAD-2025-0054', patientName: 'Ahmed Khan', mrNo: 'MR-001236', forceNo: 'F-12347', test: 'MRI Spine', doctor: 'Dr. Ahmad Khan', requestDate: '2025-01-31', status: 'completed' },
  { id: '4', requestNo: 'RAD-2025-0053', patientName: 'Sara Bibi', mrNo: 'MR-001237', forceNo: 'F-12348', test: 'CT Scan Brain', doctor: 'Dr. Usman Malik', requestDate: '2025-01-31', status: 'completed' },
];

const RadiologyRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary"><PlayCircle className="w-3 h-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStartExam = (request: any) => {
    toast.success(`Started examination for ${request.patientName}`);
  };

  const handleUploadReport = (request: any) => {
    setSelectedRequest(request);
    setIsReportDialogOpen(true);
  };

  const handleSaveReport = () => {
    toast.success(`Report saved for ${selectedRequest?.patientName}`);
    setIsReportDialogOpen(false);
    setFindings('');
    setImpression('');
  };

  const filteredRequests = mockRadiologyRequests.filter((req) =>
    req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.mrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requestNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="radiologist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Radiology Requests</h2>
            <p className="text-muted-foreground">Manage imaging requests and upload reports</p>
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
                  <p className="text-2xl font-bold">{mockRadiologyRequests.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
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
                  <p className="text-2xl font-bold">{mockRadiologyRequests.filter(r => r.status === 'in-progress').length}</p>
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
                  <p className="text-2xl font-bold">{mockRadiologyRequests.filter(r => r.status === 'completed').length}</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Imaging Requests</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by MR No, Request No"
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
                      <TableHead>Requested By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableCell>{req.doctor}</TableCell>
                        <TableCell>{req.requestDate}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {req.status === 'pending' && (
                              <Button size="sm" onClick={() => handleStartExam(req)}>
                                <Scan className="w-4 h-4 mr-1" />
                                Start Exam
                              </Button>
                            )}
                            {req.status === 'in-progress' && (
                              <Button size="sm" onClick={() => handleUploadReport(req)}>
                                <Upload className="w-4 h-4 mr-1" />
                                Upload Report
                              </Button>
                            )}
                            {req.status === 'completed' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Image className="w-4 h-4 mr-1" />
                                  View Images
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Printer className="w-4 h-4 mr-1" />
                                  Print
                                </Button>
                              </>
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
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground py-8">Pending requests</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="in-progress">
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground py-8">In-progress requests</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground py-8">Completed requests</p></CardContent></Card>
          </TabsContent>
        </Tabs>

        {/* Report Upload Dialog */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Radiology Report</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedRequest.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MR No</p>
                    <p className="font-medium">{selectedRequest.mrNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test</p>
                    <p className="font-medium">{selectedRequest.test}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Request No</p>
                    <p className="font-medium">{selectedRequest.requestNo}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Upload Images</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop images here or click to browse</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Findings</Label>
                  <Textarea
                    placeholder="Enter radiological findings..."
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impression</Label>
                  <Textarea
                    placeholder="Enter final impression..."
                    value={impression}
                    onChange={(e) => setImpression(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveReport}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save & Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RadiologyRequests;
