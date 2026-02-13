import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, FileImage, Clock, Loader2, CheckCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

const UploadReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [radiologyRequests, setRadiologyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRadiologyRequests();
  }, []);

  const fetchRadiologyRequests = async () => {
    try {
      const response = await api.getRadiologyRequests();
      if (response.success) {
        setRadiologyRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching radiology requests:', error);
      toast.error('Failed to load radiology requests');
    } finally {
      setLoading(false);
    }
  };

  const inProgressScans = radiologyRequests.filter(r => r.status === 'in-progress');
  const pendingScans = radiologyRequests.filter(r => r.status === 'pending');
  const completedCount = radiologyRequests.filter(r => r.status === 'completed').length;
  const uploadableScans = radiologyRequests.filter(r => r.status === 'in-progress' || r.status === 'pending');

  const filteredScans = uploadableScans.filter(scan =>
    scan.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.mrNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.requestNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary"><PlayCircle className="w-3 h-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStartExam = async (request: any) => {
    try {
      const response = await api.updateRadiologyRequest(request.id, { status: 'in-progress' });
      if (response.success) {
        setRadiologyRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'in-progress' } : r));
        toast.success(`Started examination for ${request.patientName}`);
      } else {
        toast.error(response.message || 'Failed to start exam');
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      toast.error('Failed to start exam');
    }
  };

  const handleUploadReport = (scan: any) => {
    setSelectedScan(scan);
    setFindings('');
    setImpression('');
    setIsUploadDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    if (!findings.trim() || !impression.trim()) {
      toast.error('Please enter findings and impression');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.updateRadiologyRequest(selectedScan.id, {
        status: 'completed',
        report: { findings, impression },
      });
      if (response.success) {
        setRadiologyRequests(prev => prev.map(r => r.id === selectedScan.id ? { ...r, status: 'completed', report: { findings, impression } } : r));
        toast.success(`Report uploaded for ${selectedScan?.patientName}`);
        setIsUploadDialogOpen(false);
        setFindings('');
        setImpression('');
        setSelectedScan(null);
      } else {
        toast.error(response.message || 'Failed to upload report');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Failed to upload report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="radiologist">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="radiologist">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Reports</h1>
          <p className="text-muted-foreground">Upload X-Ray, MRI, and CT scan reports</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingScans.length}</p>
                <p className="text-sm text-muted-foreground">Pending Exams</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileImage className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressScans.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name, MR No, or Request No..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Scans Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>MR No</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScans.length > 0 ? filteredScans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-bold text-primary">{scan.requestNo}</TableCell>
                  <TableCell className="font-medium">{scan.patientName}</TableCell>
                  <TableCell>{scan.mrNo || '-'}</TableCell>
                  <TableCell>{scan.test || scan.testType}</TableCell>
                  <TableCell>{scan.doctor}</TableCell>
                  <TableCell>{scan.requestDate}</TableCell>
                  <TableCell>{getStatusBadge(scan.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {scan.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleStartExam(scan)}>
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Start Exam
                        </Button>
                      )}
                      {scan.status === 'in-progress' && (
                        <Button size="sm" onClick={() => handleUploadReport(scan)} className="gap-2">
                          <Upload className="w-4 h-4" />
                          Upload Report
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No pending or in-progress scans
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload Radiology Report</DialogTitle>
              <DialogDescription>
                {selectedScan?.test || selectedScan?.testType} for {selectedScan?.patientName} ({selectedScan?.mrNo || selectedScan?.requestNo})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedScan?.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request No</p>
                  <p className="font-medium">{selectedScan?.requestNo}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Findings *</Label>
                <Textarea
                  placeholder="Enter detailed findings..."
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Impression / Conclusion *</Label>
                <Textarea
                  placeholder="Enter impression..."
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitReport} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UploadReports;
