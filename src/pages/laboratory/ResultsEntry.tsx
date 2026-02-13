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
import { Search, FileText, Activity, Loader2, CheckCircle, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

const ResultsEntry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [resultText, setResultText] = useState('');
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLabRequests();
  }, []);

  const fetchLabRequests = async () => {
    try {
      const response = await api.getLabRequests();
      if (response.success) {
        setLabRequests(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching lab requests:', error);
      toast.error('Failed to load lab requests');
    } finally {
      setLoading(false);
    }
  };

  const awaitingResults = labRequests.filter(r => r.status === 'sample-collected' || r.status === 'in-progress');
  const completedCount = labRequests.filter(r => r.status === 'completed').length;

  const filteredTests = awaitingResults.filter(test =>
    test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.mrNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.requestNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnterResults = (test: any) => {
    setSelectedTest(test);
    setResultText(typeof test.result === 'string' ? test.result : '');
    setIsEntryDialogOpen(true);
  };

  const handleSubmitResults = async () => {
    if (!resultText.trim()) {
      toast.error('Please enter test results');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.updateLabRequest(selectedTest.id, {
        status: 'completed',
        result: resultText,
      });
      if (response.success) {
        setLabRequests(prev => prev.map(r => r.id === selectedTest.id ? { ...r, status: 'completed', result: resultText } : r));
        toast.success(`Results submitted for ${selectedTest?.patientName}`);
        setIsEntryDialogOpen(false);
        setResultText('');
        setSelectedTest(null);
      } else {
        toast.error(response.message || 'Failed to submit results');
      }
    } catch (error) {
      console.error('Error submitting results:', error);
      toast.error('Failed to submit results');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sample-collected':
        return <Badge className="bg-blue-500 text-white"><FlaskConical className="w-3 h-3 mr-1" /> Sample Collected</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary"><Activity className="w-3 h-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
                <p className="text-2xl font-bold">{awaitingResults.length}</p>
                <p className="text-sm text-muted-foreground">Awaiting Results</p>
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

        {/* Tests Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>MR No</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.length > 0 ? filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-bold text-primary">{test.requestNo}</TableCell>
                  <TableCell className="font-medium">{test.patientName}</TableCell>
                  <TableCell>{test.mrNo || '-'}</TableCell>
                  <TableCell>{test.test}</TableCell>
                  <TableCell>{test.doctor}</TableCell>
                  <TableCell>{getStatusBadge(test.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleEnterResults(test)}>
                      <FileText className="w-4 h-4 mr-1" />
                      Enter Results
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tests awaiting results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results Entry Dialog */}
        <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enter Test Results</DialogTitle>
              <DialogDescription>
                {selectedTest?.test} for {selectedTest?.patientName} ({selectedTest?.mrNo || selectedTest?.requestNo})
              </DialogDescription>
            </DialogHeader>
            {selectedTest && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedTest.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MR No</p>
                    <p className="font-medium">{selectedTest.mrNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test</p>
                    <p className="font-medium">{selectedTest.test}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Request No</p>
                    <p className="font-medium">{selectedTest.requestNo}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Test Results *</Label>
                  <Textarea
                    placeholder="Enter detailed test results, values, and observations..."
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                    rows={8}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitResults} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Submit Results
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ResultsEntry;
