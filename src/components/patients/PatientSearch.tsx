import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Eye,
  Edit,
  Calendar,
  FileText,
  Phone,
  User,
  Loader2,
} from 'lucide-react';
import api from '@/utils/api';
import { toast } from 'sonner';

const PatientSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'forceNo' | 'name'>('all');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.getPatients();
      if (res.success && res.data) {
        const patientList = (Array.isArray(res.data) ? res.data : []).map((p: any) => ({
          id: p._id || p.id,
          forceNo: p.forceNo || 'N/A',
          name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.name || 'Unknown',
          gender: p.gender || 'N/A',
          age: p.age || 0,
          phone: p.phone || 'N/A',
          bloodGroup: p.bloodGroup || 'N/A',
          lastVisit: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A',
          status: 'active',
        }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchPatients();

    // Check if we were just redirected from patient registration
    if (sessionStorage.getItem('refreshPatients') === 'true') {
      sessionStorage.removeItem('refreshPatients');
      // Refetch to ensure new patient is visible
      setTimeout(() => fetchPatients(), 500);
    }

    // Auto-refresh every 5 seconds to catch newly registered patients
    const interval = setInterval(fetchPatients, 5000);

    // Also refetch when the page becomes visible (returns from another page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPatients();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    switch (searchType) {
      case 'forceNo':
        return patient.forceNo.toLowerCase().includes(query);
      case 'name':
        return patient.name.toLowerCase().includes(query);
      default:
        return (
          patient.forceNo.toLowerCase().includes(query) ||
          patient.name.toLowerCase().includes(query) ||
          patient.phone.includes(query)
        );
    }
  });

  const handleViewDetails = (patientId: string) => {
    navigate(`/receptionist/patients/${patientId}`);
  };

  const handleEditPatient = (patientId: string) => {
    navigate(`/receptionist/patients/${patientId}/edit`);
  };

  const handleBookAppointment = (patientId: string, patientName: string) => {
    // Store patient info in sessionStorage to pre-fill the form
    sessionStorage.setItem('selectedPatientId', patientId);
    sessionStorage.setItem('selectedPatientName', patientName);
    navigate('/receptionist/entries');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Search Patients</h2>
          <p className="text-muted-foreground">Find patients by Force No or Name</p>
        </div>
        <Button onClick={() => navigate('/receptionist/patients/register')}>
          <User className="w-4 h-4 mr-2" />
          New Patient
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Force No, Name, or Phone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'forceNo', 'name'] as const).map((type) => (
                <Button
                  key={type}
                  variant={searchType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType(type)}
                >
                  {type === 'all' ? 'All' : type === 'forceNo' ? 'Force No' : 'Name'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Search Results ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading patients...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Force No</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Gender / Age</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {patients.length === 0 ? 'No patients registered yet' : 'No patients found matching your search'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.forceNo}</TableCell>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.gender} / {patient.age}y</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.bloodGroup}</Badge>
                        </TableCell>
                        <TableCell>{patient.lastVisit}</TableCell>
                        <TableCell>
                          <Badge
                            variant={patient.status === 'active' ? 'default' : 'secondary'}
                            className={patient.status === 'active' ? 'bg-success text-success-foreground' : ''}
                          >
                            {patient.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSearch;
