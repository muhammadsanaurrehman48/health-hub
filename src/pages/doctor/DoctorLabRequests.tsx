import React, { useState } from 'react';
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
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  FlaskConical,
  FileText,
  Plus,
} from 'lucide-react';

const mockLabRequests = [
  { id: '1', requestNo: 'LAB-2025-0123', patientName: 'Muhammad Ali', mrNo: 'MR-001234', test: 'Complete Blood Count', requestDate: '2025-02-01', status: 'completed', result: 'Normal' },
  { id: '2', requestNo: 'LAB-2025-0122', patientName: 'Fatima Begum', mrNo: 'MR-001235', test: 'Blood Sugar Fasting', requestDate: '2025-02-01', status: 'pending', result: '-' },
  { id: '3', requestNo: 'LAB-2025-0121', patientName: 'Ahmed Khan', mrNo: 'MR-001236', test: 'Lipid Profile', requestDate: '2025-01-31', status: 'completed', result: 'Elevated LDL' },
  { id: '4', requestNo: 'LAB-2025-0120', patientName: 'Sara Bibi', mrNo: 'MR-001237', test: 'HbA1c', requestDate: '2025-01-31', status: 'in-progress', result: '-' },
];

const mockPatients = [
  { mrNo: 'MR-001234', name: 'Muhammad Ali' },
  { mrNo: 'MR-001235', name: 'Fatima Begum' },
  { mrNo: 'MR-001236', name: 'Ahmed Khan' },
];

const availableTests = [
  'Complete Blood Count',
  'Blood Sugar Fasting',
  'Blood Sugar Random',
  'HbA1c',
  'Lipid Profile',
  'Liver Function Test',
  'Kidney Function Test',
  'Thyroid Panel',
  'Urine Analysis',
  'Serum Electrolytes',
];

const sampleLabReport = {
  requestNo: 'LAB-2025-0121',
  patientName: 'Ahmed Khan',
  mrNo: 'MR-001236',
  test: 'Lipid Profile',
  requestDate: '2025-01-31',
  reportDate: '2025-01-31',
  results: [
    { parameter: 'Total Cholesterol', value: '220', unit: 'mg/dL', reference: '<200', status: 'high' },
    { parameter: 'LDL Cholesterol', value: '150', unit: 'mg/dL', reference: '<100', status: 'high' },
    { parameter: 'HDL Cholesterol', value: '45', unit: 'mg/dL', reference: '>40', status: 'normal' },
    { parameter: 'Triglycerides', value: '180', unit: 'mg/dL', reference: '<150', status: 'high' },
  ],
  remarks: 'Elevated LDL and total cholesterol. Lifestyle modifications and statin therapy recommended.',
  technician: 'Lab Tech Ahmad',
  pathologist: 'Dr. Fatima Naz',
};

const DoctorLabRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Request form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

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

  const handleToggleTest = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  const handleRequestTests = () => {
    if (!selectedPatient || selectedTests.length === 0) {
      toast.error('Please select patient and at least one test');
      return;
    }
    toast.success(`${selectedTests.length} lab test(s) requested successfully!`);
    setIsRequestDialogOpen(false);
    setSelectedPatient('');
    setSelectedTests([]);
  };

  const handleViewReport = (req: any) => {
    if (req.status === 'completed') {
      setSelectedReport(sampleLabReport);
      setIsReportSheetOpen(true);
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
          <Button onClick={() => setIsRequestDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Tests
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
                              <Button variant="outline" size="sm" onClick={() => handleViewReport(req)}>
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

        {/* Request Tests Dialog */}
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Laboratory Tests</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Patient *</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search patient by MR No" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((p) => (
                      <SelectItem key={p.mrNo} value={p.mrNo}>
                        {p.name} - {p.mrNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Tests *</Label>
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
                <FlaskConical className="w-4 h-4 mr-2" />
                Request Tests
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Report Sheet */}
        <Sheet open={isReportSheetOpen} onOpenChange={setIsReportSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Lab Report</SheetTitle>
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

                <div>
                  <h4 className="font-semibold mb-3">Results</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReport.results.map((r: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{r.parameter}</TableCell>
                          <TableCell>{r.value}</TableCell>
                          <TableCell>{r.unit}</TableCell>
                          <TableCell>{r.reference}</TableCell>
                          <TableCell>
                            <Badge className={r.status === 'normal' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                              {r.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Remarks</h4>
                  <p className="text-sm">{selectedReport.remarks}</p>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>Technician: {selectedReport.technician}</p>
                  <p>Pathologist: {selectedReport.pathologist}</p>
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

export default DoctorLabRequests;
