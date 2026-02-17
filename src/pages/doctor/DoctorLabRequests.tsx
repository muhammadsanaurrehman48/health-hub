import React, { useState, useEffect, useCallback } from 'react';
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
  Eye,
  CheckCircle,
  Clock,
  FlaskConical,
  FileText,
  Plus,
  Loader2,
  RefreshCw,
  Printer,
} from 'lucide-react';

const availableTests = [
  'CPC & ESR',
  'MPICT',
  'Hb %',
  'H.C.V & Hbs Ag',
  'Urine D/R',
  'Pregnancy Test',
  'Stool DR',
  'FBS',
  'RBS',
  'LFT\'s',
  'SGPT',
  'Dengue',
  'H Pylori (Stool)',
  'H Pylori (Blood)',
  'Lipid Profile',
  'Cholesterol',
  'Uric Acid',
  'Blood Grouping',
  'ALK Phos',
  'T.G',
  'HDL',
  'Urea',
  'Creatinine',
  'Platelets',
  'HIV',
  'MP',
];

// Helper to format result - handles objects like {fev1, fvc, ratio}
const formatResult = (result: any): string => {
  if (result === null || result === undefined) return '-';
  if (typeof result === 'string') return result;
  if (typeof result === 'number') return String(result);
  if (typeof result === 'object') {
    // Convert object to readable string
    return Object.entries(result)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');
  }
  return String(result);
};

// Remove duplicate requests that occasionally arrive twice from the API
const dedupeRequests = (requests: any[]) => {
  const seen = new Map<string, any>();
  requests.forEach((req) => {
    const key = req.id || req.requestNo || `${req.patientName}-${req.test}-${req.requestDate}`;
    if (!seen.has(key)) {
      seen.set(key, req);
    }
  });
  return Array.from(seen.values());
};

const DoctorLabRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Dynamic data states
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Request form state
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  // Fetch data
  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [labRes, patientsRes] = await Promise.all([
        api.getLabRequests().catch(() => ({ success: false, data: [] })),
        api.getPatients().catch(() => ({ success: false, data: [] })),
      ]);

      if (labRes.success && labRes.data) {
        const requests = (Array.isArray(labRes.data) ? labRes.data : []).map((req: any) => ({
          id: req._id || req.id,
          requestNo: req.requestNo || `LAB-${new Date().getFullYear()}-${String(req._id).slice(-4)}`,
          patientName: req.patient?.name || req.patientName || 'Unknown',
          mrNo: req.patient?.mrNo || req.mrNo || '',
          test: req.testName || req.test || 'Lab Test',
          requestDate: req.requestDate ? new Date(req.requestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: req.status || 'pending',
          result: formatResult(req.result || req.summary || '-'),
          fullData: req,
        }));
        setLabRequests(dedupeRequests(requests));
      }

      if (patientsRes.success && patientsRes.data) {
        const patientList = (Array.isArray(patientsRes.data) ? patientsRes.data : []).map((p: any) => ({
          id: p._id || p.id,
          mrNo: p.mrNo || p.patientNo || `MR-${String(p._id).slice(-6)}`,
          name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || 'Unknown',
        }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      toast.error('Failed to load lab requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleRefresh = () => fetchData(true);

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
      const patient = patients.find(p => p.mrNo === selectedPatient);
      const invoiceInfos: string[] = [];
      for (const test of selectedTests) {
        const res = await api.createLabRequest({
          patientId: patient?.id,
          mrNo: selectedPatient,
          test: test,
        });
        if (res?.data?.invoice) {
          invoiceInfos.push(`${test}: ${res.data.invoice.invoiceNo} (Rs. ${res.data.invoice.amount})`);
        }
      }
      toast.success(`${selectedTests.length} lab test(s) requested successfully!`, {
        description: invoiceInfos.length > 0
          ? `Invoice(s) auto-generated: ${invoiceInfos.join(', ')}. Receptionist notified for payment.`
          : 'Receptionist notified.',
      });
      setIsRequestDialogOpen(false);
      setSelectedPatient('');
      setSelectedTests([]);
      fetchData(true); // Refresh list
    } catch (error) {
      console.error('Error requesting tests:', error);
      toast.error('Failed to request tests');
    }
  };

  const handleViewReport = async (req: any) => {
    if (req.status === 'completed') {
      try {
        const response = await api.getLabRequest(req.id).catch(() => null);
        if (response?.success && response.data) {
          const report = response.data;
          setSelectedReport({
            requestNo: report.requestNo || req.requestNo,
            patientName: report.patient?.name || report.patientName || req.patientName,
            mrNo: report.patient?.mrNo || report.mrNo || req.mrNo,
            test: report.testName || report.test || req.test,
            requestDate: report.requestDate ? new Date(report.requestDate).toISOString().split('T')[0] : req.requestDate,
            reportDate: report.reportDate ? new Date(report.reportDate).toISOString().split('T')[0] : req.requestDate,
            results: report.results || [],
            remarks: report.remarks || 'No remarks',
            technician: report.technician || 'Lab Technician',
            pathologist: report.pathologist || 'Pathologist',
          });
        } else {
          setSelectedReport({
            requestNo: req.requestNo,
            patientName: req.patientName,
            mrNo: req.mrNo,
            test: req.test,
            requestDate: req.requestDate,
            reportDate: req.requestDate,
            results: [],
            remarks: req.result || 'View full report',
            technician: 'Lab Technician',
            pathologist: 'Pathologist',
          });
        }
        setIsReportSheetOpen(true);
      } catch (error) {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report');
      }
    }
  };

  const handlePrintReport = () => {
    if (!selectedReport) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }
    
    let resultsHTML = '';
    if (selectedReport.results && selectedReport.results.length > 0) {
      resultsHTML = '<table style="width:100%; border-collapse:collapse; margin: 16px 0;"><thead><tr style="background:#f0f0f0;">';
      resultsHTML += '<th style="border:1px solid #ddd; padding:8px;">Parameter</th>';
      resultsHTML += '<th style="border:1px solid #ddd; padding:8px;">Value</th>';
      resultsHTML += '<th style="border:1px solid #ddd; padding:8px;">Unit</th>';
      resultsHTML += '<th style="border:1px solid #ddd; padding:8px;">Reference</th>';
      resultsHTML += '<th style="border:1px solid #ddd; padding:8px;">Status</th>';
      resultsHTML += '</tr></thead><tbody>';
      selectedReport.results.forEach((r: any) => {
        const statusColor = r.status === 'normal' ? '#22c55e' : '#f59e0b';
        resultsHTML += '<tr>';
        resultsHTML += '<td style="border:1px solid #ddd; padding:8px; font-weight:500;">' + r.parameter + '</td>';
        resultsHTML += '<td style="border:1px solid #ddd; padding:8px;">' + r.value + '</td>';
        resultsHTML += '<td style="border:1px solid #ddd; padding:8px;">' + r.unit + '</td>';
        resultsHTML += '<td style="border:1px solid #ddd; padding:8px;">' + r.reference + '</td>';
        resultsHTML += '<td style="border:1px solid #ddd; padding:8px; color:' + statusColor + '; font-weight:bold;">' + r.status + '</td>';
        resultsHTML += '</tr>';
      });
      resultsHTML += '</tbody></table>';
    }
    
    const html = [
      '<!DOCTYPE html><html><head><title>Lab Report - ' + selectedReport.requestNo + '</title>',
      '<style>body{font-family:Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto;}',
      '.header{text-align:center;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:16px;}',
      '.header h1{margin:0;color:#0066cc;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0;padding:16px;background:#f9f9f9;border-radius:8px;}',
      '.info-item{}.info-label{color:#666;font-size:12px;}.info-value{font-weight:500;}',
      '.remarks{padding:16px;background:#fff3cd;border-radius:8px;margin:16px 0;}',
      '.footer{display:flex;justify-content:space-between;margin-top:24px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#666;}',
      '@media print{body{padding:0;}}</style></head><body>',
      '<div class="header"><h1>SMART HOSPITAL</h1><p>Laboratory Report</p></div>',
      '<div class="info-grid">',
      '<div class="info-item"><div class="info-label">Patient</div><div class="info-value">' + selectedReport.patientName + '</div></div>',
      '<div class="info-item"><div class="info-label">MR No</div><div class="info-value">' + selectedReport.mrNo + '</div></div>',
      '<div class="info-item"><div class="info-label">Test</div><div class="info-value">' + selectedReport.test + '</div></div>',
      '<div class="info-item"><div class="info-label">Report Date</div><div class="info-value">' + selectedReport.reportDate + '</div></div>',
      '</div>',
      '<h3>Results</h3>' + resultsHTML,
      '<div class="remarks"><strong>Remarks:</strong> ' + selectedReport.remarks + '</div>',
      '<div class="footer"><span>Technician: ' + selectedReport.technician + '</span><span>Pathologist: ' + selectedReport.pathologist + '</span></div>',
      '</body></html>'
    ].join('');
    
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const filteredRequests = labRequests.filter((req) =>
    req.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.mrNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requestNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending' || r.status === 'in-progress');
  const completedRequests = filteredRequests.filter(r => r.status === 'completed');

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
            <h2 className="text-2xl font-bold text-foreground">Lab Test Requests</h2>
            <p className="text-muted-foreground">View status of laboratory tests you've requested</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsRequestDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Request Tests
            </Button>
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
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No lab requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((req) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="pt-6">
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending requests</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request No</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-bold text-primary">{req.requestNo}</TableCell>
                          <TableCell>{req.patientName}</TableCell>
                          <TableCell>{req.test}</TableCell>
                          <TableCell>{req.requestDate}</TableCell>
                          <TableCell>{getStatusBadge(req.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="pt-6">
                {completedRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No completed requests</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request No</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-bold text-primary">{req.requestNo}</TableCell>
                          <TableCell>{req.patientName}</TableCell>
                          <TableCell>{req.test}</TableCell>
                          <TableCell>{req.requestDate}</TableCell>
                          <TableCell>{req.result}</TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" onClick={() => handleViewReport(req)}>
                                <FileText className="w-4 h-4 mr-1" />
                                View
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
                    {patients.length === 0 ? (
                      <SelectItem value="" disabled>No patients found</SelectItem>
                    ) : (
                      patients.map((p) => (
                        <SelectItem key={p.mrNo || p.id} value={p.mrNo}>
                          {p.name} - {p.mrNo}
                        </SelectItem>
                      ))
                    )}
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

                <Button className="w-full" variant="outline" onClick={handlePrintReport}>
                  <Printer className="w-4 h-4 mr-2" />
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
