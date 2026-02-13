import React, { useState, useEffect } from 'react';
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
import { Search, Check, Clock, Beaker, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/utils/api';

const SampleCollection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState<string | null>(null);

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

  const pendingSamples = labRequests.filter(r => r.status === 'pending');
  const collectedCount = labRequests.filter(r => r.status === 'sample-collected' || r.status === 'in-progress' || r.status === 'completed').length;

  const filteredSamples = pendingSamples.filter(sample =>
    sample.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.mrNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.requestNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCollectSample = async (request: any) => {
    setCollectingId(request.id);
    try {
      const response = await api.updateLabRequest(request.id, { status: 'sample-collected' });
      if (response.success) {
        setLabRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'sample-collected' } : r));
        toast.success(`Sample collected for ${request.patientName}`);
      } else {
        toast.error(response.message || 'Failed to collect sample');
      }
    } catch (error) {
      console.error('Error collecting sample:', error);
      toast.error('Failed to collect sample');
    } finally {
      setCollectingId(null);
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
                <p className="text-2xl font-bold">{pendingSamples.length}</p>
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
                <p className="text-2xl font-bold">{collectedCount}</p>
                <p className="text-sm text-muted-foreground">Collected / Processed</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Beaker className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{labRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
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

        {/* Samples Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request No</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>MR No</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSamples.length > 0 ? filteredSamples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell className="font-bold text-primary">{sample.requestNo}</TableCell>
                  <TableCell className="font-medium">{sample.patientName}</TableCell>
                  <TableCell>{sample.mrNo || '-'}</TableCell>
                  <TableCell>{sample.test}</TableCell>
                  <TableCell>{sample.doctor}</TableCell>
                  <TableCell>{sample.requestDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      disabled={collectingId === sample.id}
                      onClick={() => handleCollectSample(sample)}
                    >
                      {collectingId === sample.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Beaker className="w-4 h-4 mr-1" />
                      )}
                      Collect Sample
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No pending samples to collect
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SampleCollection;
