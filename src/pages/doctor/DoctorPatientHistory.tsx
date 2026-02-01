import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  User,
  Calendar,
  FileText,
  Activity,
  Pill,
  Beaker,
  Scan,
} from 'lucide-react';

const mockPatientHistory = [
  {
    id: '1',
    date: '2025-02-01',
    type: 'OPD Visit',
    doctor: 'Dr. Ahmad Khan',
    diagnosis: 'Hypertension',
    prescription: 'RX-456789',
    notes: 'BP high, prescribed medication',
  },
  {
    id: '2',
    date: '2025-01-15',
    type: 'Lab Report',
    doctor: 'Dr. Ahmad Khan',
    diagnosis: 'Blood Tests',
    prescription: '-',
    notes: 'CBC normal, Lipid profile elevated',
  },
  {
    id: '3',
    date: '2025-01-10',
    type: 'OPD Visit',
    doctor: 'Dr. Sara Ali',
    diagnosis: 'Flu',
    prescription: 'RX-456750',
    notes: 'Seasonal flu, recovered',
  },
  {
    id: '4',
    date: '2024-12-20',
    type: 'Radiology',
    doctor: 'Dr. Ahmad Khan',
    diagnosis: 'Chest X-Ray',
    prescription: '-',
    notes: 'Clear lungs, no abnormalities',
  },
];

const DoctorPatientHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const mockPatients = [
    { mrNo: 'MR-001234', name: 'Muhammad Ali', age: 45, gender: 'Male', bloodGroup: 'A+', phone: '0300-1234567' },
    { mrNo: 'MR-001235', name: 'Fatima Begum', age: 32, gender: 'Female', bloodGroup: 'B+', phone: '0321-2345678' },
    { mrNo: 'MR-001236', name: 'Ahmed Khan', age: 28, gender: 'Male', bloodGroup: 'O+', phone: '0333-3456789' },
  ];

  const handleSearch = () => {
    const patient = mockPatients.find(p => 
      p.mrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSelectedPatient(patient || null);
  };

  return (
    <DashboardLayout requiredRole="doctor">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Medical History</h2>
          <p className="text-muted-foreground">View complete medical records of patients</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by MR No or Patient Name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {selectedPatient && (
          <>
            {/* Patient Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{selectedPatient.name}</h3>
                      <p className="text-muted-foreground">
                        {selectedPatient.mrNo} | {selectedPatient.age}y / {selectedPatient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Blood Group</p>
                      <Badge variant="outline" className="mt-1">{selectedPatient.bloodGroup}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Total Visits</p>
                      <p className="font-bold text-primary text-lg">12</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Records */}
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">
                  <FileText className="w-4 h-4 mr-2" />
                  All Records
                </TabsTrigger>
                <TabsTrigger value="visits">
                  <Calendar className="w-4 h-4 mr-2" />
                  OPD Visits
                </TabsTrigger>
                <TabsTrigger value="lab">
                  <Beaker className="w-4 h-4 mr-2" />
                  Lab Reports
                </TabsTrigger>
                <TabsTrigger value="radiology">
                  <Scan className="w-4 h-4 mr-2" />
                  Radiology
                </TabsTrigger>
                <TabsTrigger value="prescriptions">
                  <Pill className="w-4 h-4 mr-2" />
                  Prescriptions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Diagnosis / Report</TableHead>
                          <TableHead>Prescription</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPatientHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {record.date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.type}</Badge>
                            </TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell className="font-medium">{record.diagnosis}</TableCell>
                            <TableCell>
                              {record.prescription !== '-' ? (
                                <Button variant="link" className="p-0 h-auto text-primary">
                                  {record.prescription}
                                </Button>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                              {record.notes}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visits">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      Showing OPD visits only
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lab">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      Showing lab reports only
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="radiology">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      Showing radiology reports only
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescriptions">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      Showing prescriptions only
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!selectedPatient && searchQuery && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No patient found with the given search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatientHistory;
