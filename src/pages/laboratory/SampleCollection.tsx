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
import { Search, Check, Clock, Beaker } from 'lucide-react';
import { toast } from 'sonner';

const pendingSamples = [
  { id: '1', mrNo: 'MR-001234', patient: 'Muhammad Ali', test: 'Complete Blood Count', doctor: 'Dr. Ahmed', requestTime: '09:30 AM', priority: 'normal' },
  { id: '2', mrNo: 'MR-001235', patient: 'Fatima Begum', test: 'Lipid Profile', doctor: 'Dr. Sara', requestTime: '10:00 AM', priority: 'urgent' },
  { id: '3', mrNo: 'MR-001236', patient: 'Ahmed Khan', test: 'Liver Function Test', doctor: 'Dr. Khan', requestTime: '10:15 AM', priority: 'normal' },
  { id: '4', mrNo: 'MR-001237', patient: 'Sara Hassan', test: 'Thyroid Panel', doctor: 'Dr. Fatima', requestTime: '10:45 AM', priority: 'normal' },
  { id: '5', mrNo: 'MR-001238', patient: 'Usman Ali', test: 'Urine Analysis', doctor: 'Dr. Ali', requestTime: '11:00 AM', priority: 'urgent' },
];

const SampleCollection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collectedSamples, setCollectedSamples] = useState<string[]>([]);

  const filteredSamples = pendingSamples.filter(sample =>
    sample.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.mrNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCollectSample = (sampleId: string, patientName: string) => {
    setCollectedSamples([...collectedSamples, sampleId]);
    toast.success(`Sample collected for ${patientName}`);
  };

  return (
    <DashboardLayout requiredRole="laboratory">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sample Collection</h1>
          <p className="text-muted-foreground">Record patient sample collection details</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingSamples.length - collectedSamples.length}</p>
                <p className="text-sm text-muted-foreground">Pending Collection</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{collectedSamples.length}</p>
                <p className="text-sm text-muted-foreground">Collected Today</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Beaker className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingSamples.filter(s => s.priority === 'urgent').length}</p>
                <p className="text-sm text-muted-foreground">Urgent Samples</p>
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

        {/* Samples Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MR No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSamples.map((sample) => {
                const isCollected = collectedSamples.includes(sample.id);
                return (
                  <TableRow key={sample.id}>
                    <TableCell className="font-medium text-primary">{sample.mrNo}</TableCell>
                    <TableCell>{sample.patient}</TableCell>
                    <TableCell>{sample.test}</TableCell>
                    <TableCell>{sample.doctor}</TableCell>
                    <TableCell>{sample.requestTime}</TableCell>
                    <TableCell>
                      <span className={sample.priority === 'urgent' ? 'badge-cancelled' : 'badge-pending'}>
                        {sample.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={isCollected ? 'badge-completed' : 'badge-pending'}>
                        {isCollected ? 'Collected' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={isCollected}
                        onClick={() => handleCollectSample(sample.id, sample.patient)}
                      >
                        {isCollected ? 'Done' : 'Collect Sample'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SampleCollection;
