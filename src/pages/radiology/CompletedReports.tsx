import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Search, Printer, Eye, FileImage, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

const CompletedReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [radiologyRequests, setRadiologyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

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
      toast.error('Failed to load radiology reports');
    } finally {
      setLoading(false);
    }
  };

  const completedReports = radiologyRequests.filter(r => r.status === 'completed');

  const filteredReports = completedReports.filter(report =>
    report.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.mrNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.requestNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (report: any) => {
    setViewingReport(report);
    setIsViewOpen(true);
  };

  const handlePrint = (report: any) => {
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) { alert('Please disable your popup blocker'); return; }
    const reportFindings = report.report?.findings || 'No findings recorded';
    const reportImpression = report.report?.impression || report.report?.conclusion || 'No impression recorded';
    const html = [
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Radiology Report - ' + report.requestNo + '</title>',
      '<style>',
      'body { font-family: Arial, sans-serif; padding: 30px; max-width: 700px; margin: 0 auto; }',
      '.header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }',
      '.header h1 { margin: 0; font-size: 22px; }',
      '.header p { margin: 2px 0; font-size: 12px; color: #666; }',
      '.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }',
      '.info-grid .label { font-size: 11px; color: #888; margin-bottom: 2px; }',
      '.info-grid .value { font-weight: bold; font-size: 14px; }',
      '.section { margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }',
      '.section h3 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }',
      '.section-text { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }',
      '.footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }',
      '@media print { body { padding: 15px; } }',
      '</style></head><body>',
      '<div class="header"><h1>AFS MEDICAL</h1><p>Radiology Department</p><p>Karachi | Tel: 021-1234567</p></div>',
      '<h2 style="text-align:center;margin-bottom:20px;">RADIOLOGY REPORT</h2>',
      '<div class="info-grid">',
      '<div><div class="label">Request No</div><div class="value">' + (report.requestNo || '-') + '</div></div>',
      '<div><div class="label">Date</div><div class="value">' + (report.requestDate || '-') + '</div></div>',
      '<div><div class="label">Patient</div><div class="value">' + (report.patientName || '-') + '</div></div>',
      '<div><div class="label">MR No</div><div class="value">' + (report.mrNo || '-') + '</div></div>',
      '<div><div class="label">Test</div><div class="value">' + (report.test || report.testType || '-') + '</div></div>',
      '<div><div class="label">Requested By</div><div class="value">' + (report.doctor || '-') + '</div></div>',
      '</div>',
      '<div class="section"><h3>Findings</h3><div class="section-text">' + reportFindings + '</div></div>',
      '<div class="section"><h3>Impression</h3><div class="section-text">' + reportImpression + '</div></div>',
      '<div class="footer"><p>Generated: ' + new Date().toLocaleString() + '</p><p>This is a computer-generated report</p></div>',
      '</body></html>'
    ].join('\n');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Completed Reports</h1>
            <p className="text-muted-foreground">View and print completed radiology reports</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileImage className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{completedReports.length}</p>
              <p className="text-xs text-muted-foreground">Total Reports</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Report No, MR No, or Patient name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Reports Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>MR No</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-bold text-primary">{report.requestNo}</TableCell>
                  <TableCell className="font-medium">{report.patientName}</TableCell>
                  <TableCell>{report.mrNo || '-'}</TableCell>
                  <TableCell>{report.test || report.testType}</TableCell>
                  <TableCell>{report.requestDate}</TableCell>
                  <TableCell>{report.doctor}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View" onClick={() => handleView(report)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Print" onClick={() => handlePrint(report)}>
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No completed reports found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Report Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Radiology Report — {viewingReport?.requestNo}</DialogTitle>
            </DialogHeader>
            {viewingReport && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{viewingReport.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MR No</p>
                    <p className="font-medium">{viewingReport.mrNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test</p>
                    <p className="font-medium">{viewingReport.test || viewingReport.testType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested By</p>
                    <p className="font-medium">{viewingReport.doctor}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Findings</Label>
                  <div className="p-3 bg-muted/20 rounded-lg text-sm whitespace-pre-wrap">
                    {viewingReport.report?.findings || 'No findings recorded'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Impression</Label>
                  <div className="p-3 bg-muted/20 rounded-lg text-sm whitespace-pre-wrap">
                    {viewingReport.report?.impression || viewingReport.report?.conclusion || 'No impression recorded'}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
              <Button onClick={() => { if (viewingReport) handlePrint(viewingReport); }}>
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CompletedReports;
