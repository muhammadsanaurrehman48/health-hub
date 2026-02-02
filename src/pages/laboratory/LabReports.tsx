import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Printer, Eye, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

const completedReports = [
  { id: '1', reportNo: 'LAB-2025-0456', mrNo: 'MR-001234', patient: 'Muhammad Ali', test: 'Complete Blood Count', date: '2025-02-01', doctor: 'Dr. Ahmed' },
  { id: '2', reportNo: 'LAB-2025-0455', mrNo: 'MR-001235', patient: 'Fatima Begum', test: 'Lipid Profile', date: '2025-02-01', doctor: 'Dr. Sara' },
  { id: '3', reportNo: 'LAB-2025-0454', mrNo: 'MR-001236', patient: 'Ahmed Khan', test: 'Liver Function Test', date: '2025-02-01', doctor: 'Dr. Khan' },
  { id: '4', reportNo: 'LAB-2025-0453', mrNo: 'MR-001237', patient: 'Sara Hassan', test: 'Thyroid Panel', date: '2025-01-31', doctor: 'Dr. Fatima' },
  { id: '5', reportNo: 'LAB-2025-0452', mrNo: 'MR-001238', patient: 'Usman Ali', test: 'Urine Analysis', date: '2025-01-31', doctor: 'Dr. Ali' },
  { id: '6', reportNo: 'LAB-2025-0451', mrNo: 'MR-001239', patient: 'Ayesha Siddiqui', test: 'HbA1c', date: '2025-01-31', doctor: 'Dr. Usman' },
  { id: '7', reportNo: 'LAB-2025-0450', mrNo: 'MR-001240', patient: 'Bilal Hassan', test: 'Kidney Function Test', date: '2025-01-30', doctor: 'Dr. Sara' },
];

const LabReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = completedReports.filter(report =>
    report.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.mrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (reportNo: string) => {
    toast.success(`Printing report ${reportNo}`);
  };

  const handleDownload = (reportNo: string) => {
    toast.success(`Downloading report ${reportNo}`);
  };

  return (
    <DashboardLayout requiredRole="laboratory">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lab Reports</h1>
            <p className="text-muted-foreground">View and print completed laboratory reports</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
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
                <TableHead>MR No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium text-primary">{report.reportNo}</TableCell>
                  <TableCell>{report.mrNo}</TableCell>
                  <TableCell>{report.patient}</TableCell>
                  <TableCell>{report.test}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.doctor}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Print" onClick={() => handlePrint(report.reportNo)}>
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownload(report.reportNo)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabReports;
