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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Shield, UserCheck, UserX } from 'lucide-react';
import { rolesList } from '@/types/roles';
import { toast } from 'sonner';

const mockUsers = [
  { id: '1', name: 'Dr. Ahmed Khan', email: 'ahmed.khan@hospital.com', role: 'doctor', department: 'Cardiology', status: 'active', createdAt: '2024-01-15' },
  { id: '2', name: 'Sarah Ali', email: 'sarah.ali@hospital.com', role: 'nurse', department: 'General Ward', status: 'active', createdAt: '2024-02-10' },
  { id: '3', name: 'Muhammad Hassan', email: 'm.hassan@hospital.com', role: 'receptionist', department: 'Front Desk', status: 'active', createdAt: '2024-01-20' },
  { id: '4', name: 'Dr. Fatima Bibi', email: 'fatima.b@hospital.com', role: 'radiologist', department: 'Radiology', status: 'active', createdAt: '2024-03-01' },
  { id: '5', name: 'Ali Raza', email: 'ali.raza@hospital.com', role: 'pharmacy', department: 'Pharmacy', status: 'inactive', createdAt: '2024-02-28' },
  { id: '6', name: 'Usman Khan', email: 'usman.k@hospital.com', role: 'laboratory', department: 'Laboratory', status: 'active', createdAt: '2024-01-25' },
  { id: '7', name: 'Ayesha Siddiqui', email: 'ayesha.s@hospital.com', role: 'billing', department: 'Accounts', status: 'active', createdAt: '2024-02-15' },
];

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '', department: '', password: '' });

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success(`User ${newUser.name} created successfully`);
    setIsAddDialogOpen(false);
    setNewUser({ name: '', email: '', role: '', department: '', password: '' });
  };

  const handleDeleteUser = (userName: string) => {
    toast.success(`User ${userName} deleted successfully`);
  };

  const handleToggleStatus = (userName: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(`User ${userName} is now ${newStatus}`);
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage hospital staff accounts and permissions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new staff account with role-based access</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesList.map((role) => (
                        <SelectItem key={role.role} value={role.role}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    placeholder="Enter department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Initial Password *</Label>
                  <Input
                    type="password"
                    placeholder="Set initial password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {rolesList.map((role) => (
                <SelectItem key={role.role} value={role.role}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="capitalize bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <span className={user.status === 'active' ? 'badge-completed' : 'badge-cancelled'}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleStatus(user.name, user.status)}
                      >
                        {user.status === 'active' ? (
                          <UserX className="w-4 h-4 text-orange-500" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => handleDeleteUser(user.name)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
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

export default UserManagement;
