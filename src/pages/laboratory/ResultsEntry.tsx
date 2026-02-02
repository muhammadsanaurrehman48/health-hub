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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, FileText, Activity } from 'lucide-react';
import { toast } from 'sonner';

const pendingResults = [
  { id: '1', mrNo: 'MR-001234', patient: 'Muhammad Ali', test: 'Complete Blood Count', sampleTime: '09:45 AM', status: 'processing' },
  { id: '2', mrNo: 'MR-001235', patient: 'Fatima Begum', test: 'Lipid Profile', sampleTime: '10:15 AM', status: 'processing' },
  { id: '3', mrNo: 'MR-001236', patient: 'Ahmed Khan', test: 'Liver Function Test', sampleTime: '10:30 AM', status: 'processing' },
  { id: '4', mrNo: 'MR-001237', patient: 'Sara Hassan', test: 'Thyroid Panel', sampleTime: '11:00 AM', status: 'awaiting-sample' },
];

const cbcParameters = [
  { name: 'Hemoglobin', unit: 'g/dL', normalRange: '12.0 - 17.5' },
  { name: 'RBC Count', unit: 'million/µL', normalRange: '4.5 - 5.5' },
  { name: 'WBC Count', unit: '/µL', normalRange: '4500 - 11000' },
  { name: 'Platelet Count', unit: '/µL', normalRange: '150000 - 400000' },
  { name: 'Hematocrit', unit: '%', normalRange: '36 - 50' },
  { name: 'MCV', unit: 'fL', normalRange: '80 - 100' },
  { name: 'MCH', unit: 'pg', normalRange: '27 - 33' },
  { name: 'MCHC', unit: 'g/dL', normalRange: '32 - 36' },
];

const ResultsEntry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<typeof pendingResults[0] | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState('');

  const filteredTests = pendingResults.filter(test =>
    test.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.mrNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnterResults = (test: typeof pendingResults[0]) => {
    setSelectedTest(test);
    setResults({});
    setRemarks('');
    setIsEntryDialogOpen(true);
  };

  const handleSubmitResults = () => {
    toast.success(`Results submitted for ${selectedTest?.patient}`);
    setIsEntryDialogOpen(false);
  };

  return (
    <DashboardLayout requiredRole="laboratory">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results Entry</h1>
          <p className="text-muted-foreground">Enter and update laboratory test results</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingResults.filter(t => t.status === 'processing').length}</p>
                <p className="text-sm text-muted-foreground">Awaiting Results</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
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

        {/* Tests Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MR No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Sample Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium text-primary">{test.mrNo}</TableCell>
                  <TableCell>{test.patient}</TableCell>
                  <TableCell>{test.test}</TableCell>
                  <TableCell>{test.sampleTime}</TableCell>
                  <TableCell>
                    <span className={test.status === 'processing' ? 'badge-active' : 'badge-pending'}>
                      {test.status === 'processing' ? 'Processing' : 'Awaiting Sample'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      disabled={test.status !== 'processing'}
                      onClick={() => handleEnterResults(test)}
                    >
                      Enter Results
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Results Entry Dialog */}
        <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enter Test Results</DialogTitle>
              <DialogDescription>
                {selectedTest?.test} for {selectedTest?.patient} ({selectedTest?.mrNo})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Normal Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cbcParameters.map((param) => (
                      <TableRow key={param.name}>
                        <TableCell className="font-medium">{param.name}</TableCell>
                        <TableCell>
                          <Input
                            placeholder="Enter value"
                            className="w-24"
                            value={results[param.name] || ''}
                            onChange={(e) => setResults({ ...results, [param.name]: e.target.value })}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{param.unit}</TableCell>
                        <TableCell className="text-muted-foreground">{param.normalRange}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-2">
                <Label>Remarks / Comments</Label>
                <Textarea
                  placeholder="Enter any additional remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitResults}>Submit Results</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ResultsEntry;
