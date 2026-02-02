import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
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
import { Search, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';

const transactions = [
  { id: '1', date: '2025-02-01', item: 'Paracetamol 500mg', type: 'in', quantity: 5000, department: 'Store', reference: 'PO-2025-0123', user: 'Ali Raza' },
  { id: '2', date: '2025-02-01', item: 'Surgical Gloves (L)', type: 'out', quantity: 200, department: 'OT', reference: 'REQ-2025-0456', user: 'Sara Khan' },
  { id: '3', date: '2025-02-01', item: 'Syringes 5ml', type: 'out', quantity: 500, department: 'Pharmacy', reference: 'REQ-2025-0457', user: 'Ahmed Ali' },
  { id: '4', date: '2025-01-31', item: 'IV Fluids', type: 'in', quantity: 1000, department: 'Store', reference: 'PO-2025-0122', user: 'Ali Raza' },
  { id: '5', date: '2025-01-31', item: 'Bandages', type: 'out', quantity: 150, department: 'Emergency', reference: 'REQ-2025-0455', user: 'Fatima Bibi' },
  { id: '6', date: '2025-01-31', item: 'Cotton Rolls', type: 'out', quantity: 100, department: 'Ward A', reference: 'REQ-2025-0454', user: 'Usman Khan' },
  { id: '7', date: '2025-01-30', item: 'Amoxicillin 500mg', type: 'in', quantity: 3000, department: 'Store', reference: 'PO-2025-0121', user: 'Ali Raza' },
  { id: '8', date: '2025-01-30', item: 'Face Masks', type: 'out', quantity: 500, department: 'All Departments', reference: 'REQ-2025-0453', user: 'Admin' },
];

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIn = transactions.filter(t => t.type === 'in').length;
  const totalOut = transactions.filter(t => t.type === 'out').length;

  return (
    <DashboardLayout requiredRole="inventory">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Transactions</h1>
          <p className="text-muted-foreground">View stock movement history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowDownRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalIn}</p>
                <p className="text-sm text-muted-foreground">Stock In</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOut}</p>
                <p className="text-sm text-muted-foreground">Stock Out</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by item or reference..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in">Stock In</SelectItem>
              <SelectItem value="out">Stock Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell className="font-medium text-primary">{tx.reference}</TableCell>
                  <TableCell>{tx.item}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 ${tx.type === 'in' ? 'text-green-600' : 'text-orange-600'}`}>
                      {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      {tx.type === 'in' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </TableCell>
                  <TableCell className={tx.type === 'in' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                    {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                  </TableCell>
                  <TableCell>{tx.department}</TableCell>
                  <TableCell>{tx.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
