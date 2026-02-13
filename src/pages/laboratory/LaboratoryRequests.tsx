import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/utils/api';
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
  FlaskConical,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
  Printer,
  Loader2,
} from 'lucide-react';

const LaboratoryRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [resultText, setResultText] = useState('');
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabRequests = async () => {
      try {
        const response = await api.getLabRequests();
        if (response.success) {
          setLabRequests(response.data);
        }
      } catch (error) {
        console.error('Error fetching lab requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'sample-collected':
        return <Badge className="bg-blue-500 text-white"><FlaskConical className="w-3 h-3 mr-1" /> Sample Collected</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary"><PlayCircle className="w-3 h-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCollectSample = async (request: any) => {
    try {
      const response = await api.updateLabRequest(request.id, { status: 'sample-collected' });
      if (response.success) {
        setLabRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'sample-collected' } : r));
        toast.success(`Sample collected for ${request.patientName}`);
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error collecting sample:', error);
      toast.error('Failed to collect sample');
    }
  };

  const handleEnterResult = (request: any) => {
    setSelectedRequest(request);
    setIsResultDialogOpen(true);
  };

  const handleSaveResult = async () => {
    if (!resultText.trim()) {
      toast.error('Please enter test results');
      return;
    }
    try {
      const response = await api.updateLabRequest(selectedRequest.id, {
        status: 'completed',
        result: resultText,
      });
      if (response.success) {
        setLabRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'completed', result: resultText } : r));
        toast.success(`Results saved for ${selectedRequest?.patientName}`);
        setIsResultDialogOpen(false);
        setResultText('');
        setSelectedRequest(null);
      } else {
        toast.error(response.message || 'Failed to save results');
      }
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error('Failed to save results');
    }
  };

  const handlePrintLabReport = (request: any) => {
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) { alert('Please disable your popup blocker'); return; }
    const html = [
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lab Report - ' + request.requestNo + '</title>',
      '<style>',
      'body { font-family: Arial, sans-serif; padding: 30px; max-width: 700px; margin: 0 auto; }',
      '.header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }',
      '.header h1 { margin: 0; font-size: 22px; }',
      '.header p { margin: 2px 0; font-size: 12px; color: #666; }',
      '.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }',
      '.info-grid .label { font-size: 11px; color: #888; margin-bottom: 2px; }',
      '.info-grid .value { font-weight: bold; font-size: 14px; }',
      '.result-section { margin-top: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }',
      '.result-section h3 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }',
      '.result-text { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }',
      '.footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }',
      '@media print { body { padding: 15px; } }',
      '</style></head><body>',
      '<div class="header"><h1>AFS MEDICAL</h1><p>Laboratory Department</p><p>Karachi | Tel: 021-1234567</p></div>',
      '<h2 style="text-align:center;margin-bottom:20px;">LABORATORY TEST REPORT</h2>',
      '<div class="info-grid">',
      '<div><div class="label">Request No</div><div class="value">' + (request.requestNo || '-') + '</div></div>',
      '<div><div class="label">Date</div><div class="value">' + (request.requestDate || '-') + '</div></div>',
      '<div><div class="label">Patient</div><div class="value">' + (request.patientName || '-') + '</div></div>',
      '<div><div class="label">MR No</div><div class="value">' + (request.mrNo || '-') + '</div></div>',
      '<div><div class="label">Test</div><div class="value">' + (request.test || '-') + '</div></div>',
      '<div><div class="label">Requested By</div><div class="value">' + (request.doctor || '-') + '</div></div>',
      '</div>',
      '<div class="result-section"><h3>Test Results</h3>',
      '<div class="result-text">' + (typeof request.result === 'string' ? request.result : JSON.stringify(request.result || 'No results recorded', null, 2)) + '</div></div>',
      '<div class="footer"><p>Generated: ' + new Date().toLocaleString() + '</p><p>This is a computer-generated report</p></div>',
      '</body></html>'
    ].join('\n');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
  };

  const filteredRequests = labRequests.filter((req) =>
    req.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.mrNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requestNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout requiredRole="laboratory">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="laboratory">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Lab Test Requests</h2>
            <p className="text-muted-foreground">Manage laboratory test requests and results</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{labRequests.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{labRequests.filter(r => r.status === 'sample-collected').length}</p>
                  <p className="text-sm text-muted-foreground">Sample Collected</p>
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
                  <p className="text-2xl font-bold">{labRequests.filter(r => r.status === 'in-progress').length}</p>
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
                  <p className="text-2xl font-bold">{labRequests.filter(r => r.status === 'completed').length}</p>
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
                  <CardTitle>Test Requests</CardTitle>
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
                              <Button size="sm" onClick={() => handleCollectSample(req)}>
                                <FlaskConical className="w-4 h-4 mr-1" />
                                Collect Sample
                              </Button>
                            )}
                            {(req.status === 'sample-collected' || req.status === 'in-progress') && (
                              <Button size="sm" onClick={() => handleEnterResult(req)}>
                                <FileText className="w-4 h-4 mr-1" />
                                Enter Result
                              </Button>
                            )}
                            {req.status === 'completed' && (
                              <Button variant="outline" size="sm" onClick={() => handlePrintLabReport(req)}>
                                <Printer className="w-4 h-4 mr-1" />
                                Print Report
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
              <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labRequests.filter(r => r.status === 'pending').map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-bold text-primary">{req.requestNo}</TableCell>
                        <TableCell className="font-medium">{req.patientName}</TableCell>
                        <TableCell>{req.mrNo}</TableCell>
                        <TableCell>{req.test}</TableCell>
                        <TableCell>{req.doctor}</TableCell>
                        <TableCell>{req.requestDate}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleCollectSample(req)}>
                              <FlaskConical className="w-4 h-4 mr-1" />
                              Collect Sample
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {labRequests.filter(r => r.status === 'pending').length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No pending requests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="in-progress">
            <Card>
              <CardHeader><CardTitle>In Progress / Sample Collected</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request No</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR No</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labRequests.filter(r => r.status === 'sample-collected' || r.status === 'in-progress').map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-bold text-primary">{req.requestNo}</TableCell>
                        <TableCell className="font-medium">{req.patientName}</TableCell>
                        <TableCell>{req.mrNo}</TableCell>
                        <TableCell>{req.test}</TableCell>
                        <TableCell>{req.doctor}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleEnterResult(req)}>
                              <FileText className="w-4 h-4 mr-1" />
                              Enter Result
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {labRequests.filter(r => r.status === 'sample-collected' || r.status === 'in-progress').length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No in-progress requests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card>
              <CardHeader><CardTitle>Completed Tests</CardTitle></CardHeader>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labRequests.filter(r => r.status === 'completed').map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-bold text-primary">{req.requestNo}</TableCell>
                        <TableCell className="font-medium">{req.patientName}</TableCell>
                        <TableCell>{req.mrNo}</TableCell>
                        <TableCell>{req.test}</TableCell>
                        <TableCell>{req.doctor}</TableCell>
                        <TableCell>{req.requestDate}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => handlePrintLabReport(req)}>
                              <Printer className="w-4 h-4 mr-1" />
                              Print Report
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {labRequests.filter(r => r.status === 'completed').length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No completed tests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Result Entry Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enter Test Results</DialogTitle>
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
                  <Label>Test Results</Label>
                  <Textarea
                    placeholder="Enter test results..."
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResultDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveResult}>
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

export default LaboratoryRequests;
