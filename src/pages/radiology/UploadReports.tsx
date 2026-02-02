import React, { useState } from 'react';
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
import { Search, Upload, FileImage, Clock } from 'lucide-react';
import { toast } from 'sonner';

const pendingScans = [
  { id: '1', mrNo: 'MR-001234', patient: 'Muhammad Ali', test: 'Chest X-Ray', doctor: 'Dr. Ahmed', requestTime: '09:30 AM', priority: 'urgent' },
  { id: '2', mrNo: 'MR-001235', patient: 'Fatima Begum', test: 'Brain MRI', doctor: 'Dr. Khan', requestTime: '10:00 AM', priority: 'normal' },
  { id: '3', mrNo: 'MR-001236', patient: 'Ahmed Khan', test: 'CT Abdomen', doctor: 'Dr. Sara', requestTime: '10:30 AM', priority: 'normal' },
  { id: '4', mrNo: 'MR-001237', patient: 'Sara Hassan', test: 'Spine X-Ray', doctor: 'Dr. Ali', requestTime: '11:00 AM', priority: 'normal' },
];

const UploadReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<typeof pendingScans[0] | null>(null);
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [status, setStatus] = useState('normal');

  const filteredScans = pendingScans.filter(scan =>
    scan.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.mrNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadReport = (scan: typeof pendingScans[0]) => {
    setSelectedScan(scan);
    setFindings('');
    setImpression('');
    setStatus('normal');
    setIsUploadDialogOpen(true);
  };

  const handleSubmitReport = () => {
    if (!findings || !impression) {
      toast.error('Please enter findings and impression');
      return;
    }
    toast.success(`Report uploaded for ${selectedScan?.patient}`);
    setIsUploadDialogOpen(false);
  };

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
                <p className="text-sm text-muted-foreground">Pending Reports</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileImage className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Uploaded Today</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Upload className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingScans.filter(s => s.priority === 'urgent').length}</p>
                <p className="text-sm text-muted-foreground">Urgent Cases</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or MR No..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pending Scans Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MR No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium text-primary">{scan.mrNo}</TableCell>
                  <TableCell>{scan.patient}</TableCell>
                  <TableCell>{scan.test}</TableCell>
                  <TableCell>{scan.doctor}</TableCell>
                  <TableCell>{scan.requestTime}</TableCell>
                  <TableCell>
                    <span className={scan.priority === 'urgent' ? 'badge-cancelled' : 'badge-pending'}>
                      {scan.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleUploadReport(scan)} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload Radiology Report</DialogTitle>
              <DialogDescription>
                {selectedScan?.test} for {selectedScan?.patient} ({selectedScan?.mrNo})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Drag & drop image files or click to browse</p>
                <Button variant="outline" className="mt-3">Choose Files</Button>
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal - Follow-up Required</SelectItem>
                    <SelectItem value="critical">Critical - Immediate Attention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitReport}>Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UploadReports;
