import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Users, Building2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const mockDepartments = [
  { id: '1', name: 'Cardiology', head: 'Dr. Ahmed Khan', staff: 12, patients: 45, status: 'active' },
  { id: '2', name: 'General Medicine', head: 'Dr. Fatima Bibi', staff: 18, patients: 89, status: 'active' },
  { id: '3', name: 'Orthopedics', head: 'Dr. Usman Ali', staff: 8, patients: 32, status: 'active' },
  { id: '4', name: 'Pediatrics', head: 'Dr. Sara Khan', staff: 10, patients: 56, status: 'active' },
  { id: '5', name: 'Radiology', head: 'Dr. Hassan Raza', staff: 6, patients: 0, status: 'active' },
  { id: '6', name: 'Laboratory', head: 'Mr. Ali Ahmed', staff: 8, patients: 0, status: 'active' },
  { id: '7', name: 'Pharmacy', head: 'Mr. Bilal Khan', staff: 5, patients: 0, status: 'active' },
  { id: '8', name: 'Emergency', head: 'Dr. Nadia Hussain', staff: 15, patients: 23, status: 'active' },
  { id: '9', name: 'Surgery', head: 'Dr. Tariq Mehmood', staff: 14, patients: 18, status: 'active' },
  { id: '10', name: 'Gynecology', head: 'Dr. Ayesha Siddiqui', staff: 9, patients: 34, status: 'active' },
  { id: '11', name: 'Dentistry', head: 'Dr. Kamran Ali', staff: 4, patients: 28, status: 'active' },
  { id: '12', name: 'Psychiatry', head: 'Dr. Sana Malik', staff: 5, patients: 15, status: 'inactive' },
];

const Departments: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', head: '', description: '' });

  const handleAddDepartment = () => {
    if (!newDept.name) {
      toast.error('Please enter department name');
      return;
    }
    toast.success(`Department ${newDept.name} created successfully`);
    setIsAddDialogOpen(false);
    setNewDept({ name: '', head: '', description: '' });
  };

  const activeDepartments = mockDepartments.filter(d => d.status === 'active');
  const totalStaff = mockDepartments.reduce((acc, d) => acc + d.staff, 0);
  const totalPatients = mockDepartments.reduce((acc, d) => acc + d.patients, 0);

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Department Management</h1>
            <p className="text-muted-foreground">Manage hospital departments and their heads</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>Create a new hospital department</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Department Name *</Label>
                  <Input
                    placeholder="Enter department name"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department Head</Label>
                  <Input
                    placeholder="Enter head name"
                    value={newDept.head}
                    onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Enter description"
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDepartment}>Create Department</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeDepartments.length}</p>
                  <p className="text-sm text-muted-foreground">Active Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStaff}</p>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPatients}</p>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockDepartments.map((dept) => (
            <Card key={dept.id} className={dept.status === 'inactive' ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Head:</span>
                    <span className="font-medium">{dept.head}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">{dept.staff}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Patients:</span>
                    <span className="font-medium">{dept.patients}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={dept.status === 'active' ? 'badge-completed' : 'badge-cancelled'}>
                      {dept.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Departments;
