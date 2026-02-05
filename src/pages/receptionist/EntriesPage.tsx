import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import TokenTemplate from '@/components/templates/TokenTemplate';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Ticket,
  Plus,
  Search,
  Printer,
  Clock,
  BedDouble,
  Eye,
} from 'lucide-react';

const mockOPDTokens = [
  { id: '1', tokenNo: 'OPD-045', patientName: 'Muhammad Ali', mrNo: 'MR-001234', department: 'Cardiology', doctor: 'Dr. Ahmad Khan', time: '10:15 AM', status: 'waiting' },
  { id: '2', tokenNo: 'OPD-046', patientName: 'Fatima Begum', mrNo: 'MR-001235', department: 'Pediatrics', doctor: 'Dr. Sara Ali', time: '10:20 AM', status: 'in-progress' },
  { id: '3', tokenNo: 'OPD-047', patientName: 'Ahmed Khan', mrNo: 'MR-001236', department: 'Orthopedics', doctor: 'Dr. Usman Malik', time: '10:30 AM', status: 'completed' },
];

const mockIPDEntries = [
  { id: '1', admissionNo: 'IPD-2025-001', patientName: 'Sara Bibi', mrNo: 'MR-001237', ward: 'General Ward A', bed: 'A-12', doctor: 'Dr. Ahmad Khan', admitDate: '2025-01-28', status: 'admitted' },
  { id: '2', admissionNo: 'IPD-2025-002', patientName: 'Usman Ali', mrNo: 'MR-001238', ward: 'ICU', bed: 'ICU-3', doctor: 'Dr. Fatima Bibi', admitDate: '2025-01-30', status: 'critical' },
];

const EntriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false);
  const [isTokenSheetOpen, setIsTokenSheetOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);

  // Token form
  const [tokenMrNo, setTokenMrNo] = useState('');
  const [tokenDepartment, setTokenDepartment] = useState('');
  const [tokenDoctor, setTokenDoctor] = useState('');

  // IPD form
  const [ipdMrNo, setIpdMrNo] = useState('');
  const [ipdWard, setIpdWard] = useState('');
  const [ipdBed, setIpdBed] = useState('');
  const [ipdDoctor, setIpdDoctor] = useState('');

  const handleGenerateToken = () => {
    toast.success('OPD Token generated successfully!', {
      description: 'Token No: OPD-048',
    });
    setIsTokenDialogOpen(false);
  };

  const handleAdmitPatient = () => {
    toast.success('Patient admitted successfully!', {
      description: 'Admission No: IPD-2025-003',
    });
    setIsIPDDialogOpen(false);
  };

  const handleViewToken = (token: typeof mockOPDTokens[0]) => {
    setSelectedToken({
      tokenNo: token.tokenNo,
      patientName: token.patientName,
      mrNo: token.mrNo,
      department: token.department,
      doctor: token.doctor,
      date: format(new Date(), 'dd/MM/yyyy'),
      time: token.time,
      type: 'OPD' as const,
    });
    setIsTokenSheetOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      waiting: 'bg-warning text-warning-foreground',
      'in-progress': 'bg-primary',
      completed: 'bg-success text-success-foreground',
      admitted: 'bg-primary',
      critical: 'bg-destructive',
      discharged: 'bg-muted',
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status}</Badge>;
  };

  return (
    <DashboardLayout requiredRole="receptionist">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">OPD / IPD Entries</h2>
            <p className="text-muted-foreground">Manage patient tokens and admissions</p>
          </div>
        </div>

        <Tabs defaultValue="opd" className="space-y-6">
          <TabsList>
            <TabsTrigger value="opd" className="gap-2">
              <Ticket className="w-4 h-4" />
              OPD Tokens
            </TabsTrigger>
            <TabsTrigger value="ipd" className="gap-2">
              <BedDouble className="w-4 h-4" />
              IPD Admissions
            </TabsTrigger>
          </TabsList>

          {/* OPD Tab */}
          <TabsContent value="opd" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or MR No"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Token
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate OPD Token</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Patient MR No</Label>
                      <Input
                        placeholder="Enter MR No"
                        value={tokenMrNo}
                        onChange={(e) => setTokenMrNo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={tokenDepartment} onValueChange={setTokenDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Cardiology', 'Pediatrics', 'Orthopedics', 'Gynecology', 'General', 'ENT', 'Dermatology'].map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Doctor</Label>
                      <Select value={tokenDoctor} onValueChange={setTokenDoctor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dr-ahmad">Dr. Ahmad Khan</SelectItem>
                          <SelectItem value="dr-sara">Dr. Sara Ali</SelectItem>
                          <SelectItem value="dr-usman">Dr. Usman Malik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTokenDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateToken}>
                      <Ticket className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's OPD Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token No</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR No</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOPDTokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell className="font-bold text-primary">{token.tokenNo}</TableCell>
                        <TableCell className="font-medium">{token.patientName}</TableCell>
                        <TableCell>{token.mrNo}</TableCell>
                        <TableCell>{token.department}</TableCell>
                        <TableCell>{token.doctor}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {token.time}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(token.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewToken(token)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleViewToken(token)}>
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IPD Tab */}
          <TabsContent value="ipd" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search admissions"
                  className="pl-10"
                />
              </div>
              <Dialog open={isIPDDialogOpen} onOpenChange={setIsIPDDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Admit Patient
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Admit Patient (IPD)</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Patient MR No</Label>
                      <Input
                        placeholder="Enter MR No"
                        value={ipdMrNo}
                        onChange={(e) => setIpdMrNo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ward</Label>
                      <Select value={ipdWard} onValueChange={setIpdWard}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {['General Ward A', 'General Ward B', 'Private Room', 'ICU', 'NICU', 'Surgical Ward'].map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bed Number</Label>
                      <Input
                        placeholder="e.g., A-12"
                        value={ipdBed}
                        onChange={(e) => setIpdBed(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Attending Doctor</Label>
                      <Select value={ipdDoctor} onValueChange={setIpdDoctor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dr-ahmad">Dr. Ahmad Khan</SelectItem>
                          <SelectItem value="dr-fatima">Dr. Fatima Bibi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsIPDDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdmitPatient}>
                      <BedDouble className="w-4 h-4 mr-2" />
                      Admit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Admissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>MR No</TableHead>
                      <TableHead>Ward</TableHead>
                      <TableHead>Bed</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Admit Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockIPDEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-bold text-primary">{entry.admissionNo}</TableCell>
                        <TableCell className="font-medium">{entry.patientName}</TableCell>
                        <TableCell>{entry.mrNo}</TableCell>
                        <TableCell>{entry.ward}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.bed}</Badge>
                        </TableCell>
                        <TableCell>{entry.doctor}</TableCell>
                        <TableCell>{entry.admitDate}</TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Token View/Print Sheet */}
        <Sheet open={isTokenSheetOpen} onOpenChange={setIsTokenSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>OPD Token</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {selectedToken && <TokenTemplate data={selectedToken} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default EntriesPage;
