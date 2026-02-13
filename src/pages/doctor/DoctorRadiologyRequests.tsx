import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import api from '@/utils/api';
import {
  Search,
  CheckCircle,
  Clock,
  Scan,
  FileText,
  Image,
  Plus,
  Loader2,
}from 'lucide-react';

const availableTests = [
  'Chest X-Ray PA',
  'Chest X-Ray Lateral',
  'Abdominal X-Ray',
  'Ultrasound Abdomen',
  'Ultrasound Pelvis',
  'CT Scan Brain',
  'CT Scan Chest',
  'CT Scan Abdomen',
  'MRI Brain',
  'MRI Spine',
  'MRI Knee',
  'Echo Cardiogram',
  'X-Ray Skull',
  'X-Ray Pelvis',
  'X-Ray Knee',
  'X-Ray Shoulder',
  'Ultrasound KUB',
  'CT Scan Pelvis',
  'MRI Shoulder',
  'MRI Lumbar Spine',
  'Doppler Ultrasound',
  'Mammography',
  'Bone Densitometry (DEXA)',
  'Fluoroscopy',
];

const DoctorRadiologyRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [radiologyRequests, setRadiologyRequests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Request form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [radResponse, patientResponse] = await Promise.all([
          api.getRadiologyRequests(),
          api.getPatients()
        ]);
        if (radResponse.success) {
          setRadiologyRequests(radResponse.data || []);
        }
        if (patientResponse.success) {
          const patientList = (Array.isArray(patientResponse.data) ? patientResponse.data : []).map((p: any) => ({
            id: p._id || p.id,
            mrNo: p.mrNo || p.patientNo || '',
            name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || 'Unknown',
          }));
          setPatients(patientList);
        }
      } catch (error) {
        console.error('Error fetching radiology data:', error);
        toast.error('Failed to load radiology requests');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary"><Scan className="w-3 h-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleToggleTest = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  const handleRequestTests = async () => {
    if (!selectedPatient || selectedTests.length === 0) {
      toast.error('Please select patient and at least one test');
      return;
    }
    try {
      const patient = patients.find((p: any) => p.mrNo === selectedPatient || p.id === selectedPatient);
      for (const test of selectedTests) {
        await api.createRadiologyRequest({
          patientId: patient?.id,
          patientName: patient?.name || 'Unknown',
          mrNo: selectedPatient,
          testName: test,
          requestDate: new Date().toISOString(),
          status: 'pending',
        });
      }
      toast.success(`${selectedTests.length} radiology test(s) requested successfully!`);
      setIsRequestDialogOpen(false);
      setSelectedPatient('');
      setSelectedTests([]);
      // Refresh the list
      const radResponse = await api.getRadiologyRequests();
      if (radResponse.success) {
        setRadiologyRequests(radResponse.data || []);
      }
    } catch (error) {
      console.error('Error requesting radiology tests:', error);
      toast.error('Failed to request radiology tests');
    }
  };

  const handleViewReport = (req: any) => {
    if (req.status === 'completed') {
      setSelectedReport({
        requestNo: req.requestNo,
        patientName: req.patientName,
        mrNo: req.mrNo,
        test: req.test,
        requestDate: req.requestDate,
        reportDate: req.reportDate || req.requestDate,
        findings: req.findings || 'Findings not yet available',
        impression: req.impression || 'Impression not yet available',
        radiologist: req.radiologist || 'Radiologist',
      });
      setIsReportSheetOpen(true);
    }
  };

  const filteredRequests = radiologyRequests.filter((req) =>
    req.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.mrNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requestNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout requiredRole="doctor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Radiology Requests</h2>
            <p className="text-muted-foreground">View status of imaging tests you've requested</p>
          </div>
          <Button onClick={() => setIsRequestDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Imaging
          </Button>
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
                  <CardTitle>Radiology Requests</CardTitle>
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
                      <TableHead>Finding</TableHead>
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
                          {req.finding !== '-' ? (
                            <span className={req.finding === 'Normal' ? 'text-success' : 'text-warning'}>
                              {req.finding}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {req.status === 'completed' && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleViewReport(req)}>
                                  <Image className="w-4 h-4 mr-1" />
                                  View Images
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleViewReport(req)}>
                                  <FileText className="w-4 h-4 mr-1" />
                                  Report
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

        {/* Request Tests Dialog */}
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Radiology Tests</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Patient *</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search patient by MR No" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 ? (
                      <SelectItem value="" disabled>No patients found</SelectItem>
                    ) : (
                      patients.map((p: any) => (
                        <SelectItem key={p.mrNo || p.id} value={p.mrNo}>
                          {p.name} - {p.mrNo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Imaging Tests *</Label>
                <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg max-h-60 overflow-y-auto">
                  {availableTests.map((test) => (
                    <div key={test} className="flex items-center space-x-2">
                      <Checkbox
                        id={test}
                        checked={selectedTests.includes(test)}
                        onCheckedChange={() => handleToggleTest(test)}
                      />
                      <label htmlFor={test} className="text-sm cursor-pointer">
                        {test}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedTests.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedTests.length} test(s) selected
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestTests}>
                <Scan className="w-4 h-4 mr-2" />
                Request Tests
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Report Sheet */}
        <Sheet open={isReportSheetOpen} onOpenChange={setIsReportSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Radiology Report</SheetTitle>
            </SheetHeader>
            {selectedReport && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedReport.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MR No</p>
                    <p className="font-medium">{selectedReport.mrNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test</p>
                    <p className="font-medium">{selectedReport.test}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Report Date</p>
                    <p className="font-medium">{selectedReport.reportDate}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-muted/10">
                  <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg mb-4">
                    <Image className="w-16 h-16 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Images would be displayed here</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Findings</h4>
                    <p className="text-sm">{selectedReport.findings}</p>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Impression</h4>
                    <p className="text-sm font-medium">{selectedReport.impression}</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-right">
                  <p>Radiologist: {selectedReport.radiologist}</p>
                </div>

                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default DoctorRadiologyRequests;
