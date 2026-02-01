import React, { useState } from 'react';
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
} from 'lucide-react';

// Mock patient data
const mockPatients = [
  {
    id: '1',
    mrNo: 'MR-001234',
    forceNo: 'F-12345',
    name: 'Muhammad Ali',
    gender: 'Male',
    age: 45,
    phone: '0300-1234567',
    bloodGroup: 'A+',
    lastVisit: '2025-01-28',
    status: 'active',
  },
  {
    id: '2',
    mrNo: 'MR-001235',
    forceNo: 'F-12346',
    name: 'Fatima Bibi',
    gender: 'Female',
    age: 32,
    phone: '0321-2345678',
    bloodGroup: 'B+',
    lastVisit: '2025-01-25',
    status: 'active',
  },
  {
    id: '3',
    mrNo: 'MR-001236',
    forceNo: 'F-12347',
    name: 'Ahmed Khan',
    gender: 'Male',
    age: 28,
    phone: '0333-3456789',
    bloodGroup: 'O+',
    lastVisit: '2025-01-20',
    status: 'inactive',
  },
  {
    id: '4',
    mrNo: 'MR-001237',
    forceNo: 'F-12348',
    name: 'Sara Begum',
    gender: 'Female',
    age: 55,
    phone: '0345-4567890',
    bloodGroup: 'AB+',
    lastVisit: '2025-01-15',
    status: 'active',
  },
];

const PatientSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'forceNo' | 'mrNo' | 'name'>('all');

  const filteredPatients = mockPatients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    switch (searchType) {
      case 'forceNo':
        return patient.forceNo.toLowerCase().includes(query);
      case 'mrNo':
        return patient.mrNo.toLowerCase().includes(query);
      case 'name':
        return patient.name.toLowerCase().includes(query);
      default:
        return (
          patient.forceNo.toLowerCase().includes(query) ||
          patient.mrNo.toLowerCase().includes(query) ||
          patient.name.toLowerCase().includes(query) ||
          patient.phone.includes(query)
        );
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Search Patients</h2>
          <p className="text-muted-foreground">Find patients by Force No, MR No, or Name</p>
        </div>
        <Button onClick={() => navigate('/receptionist/patients/register')}>
          <User className="w-4 h-4 mr-2" />
          New Patient
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Force No, MR No, Name, or Phone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'forceNo', 'mrNo', 'name'] as const).map((type) => (
                <Button
                  key={type}
                  variant={searchType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType(type)}
                >
                  {type === 'all' ? 'All' : type === 'forceNo' ? 'Force No' : type === 'mrNo' ? 'MR No' : 'Name'}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR No</TableHead>
                  <TableHead>Force No</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Gender / Age</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No patients found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.mrNo}</TableCell>
                      <TableCell>{patient.forceNo}</TableCell>
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
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit Patient">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Book Appointment">
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="View History">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSearch;
